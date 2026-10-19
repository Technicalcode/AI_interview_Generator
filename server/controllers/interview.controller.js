const fs = require("fs");
const Interview = require("../models/interview.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { askAi, readJson } = require("../services/openRouter.services");

const allowedTypes = ["hr", "technical", "resume", "mixed"];
const allowedDifficulties = ["easy", "medium", "hard"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value, fallback = "") => {
  return typeof value === "string" ? value.trim().slice(0, 5000) : fallback;
};

const extractJson = (content) => {
  return readJson(content, {});
};

const fallbackQuestion = ({ role, experience, type }, questionNumber = 1) => {
  const pools = {
    hr: [
      `Tell me about yourself and why you chose a career as a ${role}.`,
      `Describe a time you faced a conflict in a team. How did you resolve it?`,
      `What are your greatest strengths and how have you applied them as a ${role}?`,
      `Where do you see yourself in 5 years in your ${role} career?`,
      `Describe a situation where you had to meet a tight deadline. How did you manage it?`,
      `Tell me about a time you received critical feedback. How did you respond?`
    ],
    technical: [
      `Explain one key technical concept in ${role} that you have used in a real project.`,
      `Describe a challenging technical problem you solved. What was your approach?`,
      `How do you ensure code quality and maintainability in your projects as a ${role}?`,
      `Walk me through how you would design a scalable system for a high-traffic application.`,
      `What debugging strategies do you use when you encounter a difficult bug?`,
      `Explain a performance optimization you made in a past project and its measurable impact.`
    ],
    resume: [
      `Pick one project from your resume and explain your exact contribution, challenges, and result.`,
      `What was the most technically complex part of a project you have worked on? How did you handle it?`,
      `Describe a project where you had to learn a new technology quickly. What was your approach?`,
      `Tell me about a project that did not go as planned. What went wrong and what did you learn?`,
      `Which project from your resume are you most proud of and why?`,
      `Describe a project where you collaborated with a team. What was your specific role and contribution?`
    ],
    mixed: [
      `Tell me about yourself and your journey as a ${experience} ${role}.`,
      `Describe your most impactful project — your contribution, the challenge, and the result.`,
      `How do you stay updated with the latest technologies relevant to ${role}?`,
      `Walk me through a difficult technical decision you made in a past project.`,
      `Describe a time you worked under pressure. How did you handle it and what was the outcome?`
    ]
  };

  const pool = pools[type] || pools.mixed;
  return pool[(questionNumber - 1) % pool.length];
};

const normalizeList = (value, fallback = []) => Array.isArray(value)
  ? value.filter(Boolean).map(String).slice(0, 6)
  : fallback;

const normalizeScore = (value, fallbackScore) => {
  const rawScore = Number(value);

  if (!Number.isFinite(rawScore)) {
    return fallbackScore;
  }

  const scaledScore = rawScore > 0 && rawScore <= 10 ? rawScore * 10 : rawScore;
  return Math.round(Math.min(100, Math.max(0, scaledScore)));
};

const buildReport = (interview) => {
  const answers = interview.answers || [];
  const answered = answers.filter((item) => item.answer?.trim());
  const overallScore = answered.length
    ? Math.round(answered.reduce((sum, item) => sum + Number(item.score || 0), 0) / answered.length)
    : 0;

  const strengths = [...new Set(answered.flatMap((item) => item.strengths || []))].slice(0, 5);
  const improvements = [...new Set(answered.flatMap((item) => item.improvements || []))].slice(0, 5);

  return {
    overallScore,
    summary: answered.length
      ? `You completed ${answered.length} ${interview.type} interview questions for ${interview.role}. Your overall score is ${overallScore}/100.`
      : "No answers were submitted for this interview.",
    strengths: strengths.length ? strengths : ["Clear participation", "Completed the interview flow"],
    improvements: improvements.length ? improvements : ["Add more specific examples", "Structure answers with situation, action, and result"],
    recommendedTopics: [
      interview.role,
      `${interview.type} interview practice`,
      "Communication clarity",
      "Project explanation"
    ].filter(Boolean)
  };
};

const createQuestionWithAi = async (interview) => {
  const questionNumber = interview.answers.length + 1;
  const previousQuestions = interview.answers.map((item) => item.question);

  const resumeContext = interview.resume
    ? `Candidate Resume Info:
- Role: ${interview.resume.role || interview.role}
- Experience: ${interview.resume.experience || interview.experience}
- Projects: ${(interview.resume.projects || []).join(", ") || "Not specified"}
- Skills: ${(interview.resume.skills || []).join(", ") || "Not specified"}`
    : `Role: ${interview.role}, Experience: ${interview.experience}`;

  const messages = [
    {
      role: "system",
      content: `You are an expert technical interviewer. Generate ONE unique interview question for question number ${questionNumber} of ${interview.maxQuestions}.

${resumeContext}
Interview Type: ${interview.type}
Difficulty: ${interview.difficulty}

STRICT RULES:
1. NEVER repeat or rephrase any of these already asked questions: ${previousQuestions.length > 0 ? previousQuestions.map((q, i) => `Q${i + 1}: "${q}"`).join("; ") : "None yet"}
2. Ask about DIFFERENT topics each time — vary between: specific projects from resume, technical skills, system design, behavioral scenarios, problem-solving, and experience.
3. For question ${questionNumber}, focus on: ${getQuestionFocus(interview.type, questionNumber, interview.maxQuestions)}
4. Make the question specific to the candidate's resume/skills listed above.
5. Keep it concise — one clear question only.

Return strict JSON only:
{
  "question": "your unique question here"
}`
    },
    {
      role: "user",
      content: `Generate question ${questionNumber} for this ${interview.type} interview. Make it completely different from previous questions.`
    }
  ];

  try {
    const response = await askAi(messages);
    const parsed = readJson(response, {});
    const question = parsed.question?.trim();
    // Make sure it's not a duplicate
    if (question && !previousQuestions.some(q => q.toLowerCase().includes(question.toLowerCase().slice(0, 30)))) {
      return question;
    }
    return fallbackQuestion(interview, questionNumber);
  } catch (error) {
    console.error("createQuestionWithAi error:", error.message);
    return fallbackQuestion(interview, questionNumber);
  }
};

const getQuestionFocus = (type, questionNumber, maxQuestions) => {
  const position = questionNumber / maxQuestions;
  if (type === "hr") {
    const hrFocus = ["background and motivation", "teamwork and collaboration", "conflict resolution", "career goals", "strengths and weaknesses", "leadership experience"];
    return hrFocus[(questionNumber - 1) % hrFocus.length];
  }
  if (type === "technical") {
    const techFocus = ["a specific technical project", "system design or architecture", "a technical challenge solved", "coding concepts or algorithms", "debugging experience", "performance optimization"];
    return techFocus[(questionNumber - 1) % techFocus.length];
  }
  if (type === "resume") {
    const resumeFocus = ["a specific project contribution and result", "a challenge faced in a project", "technical decisions made", "collaboration and teamwork in projects", "project impact and outcome"];
    return resumeFocus[(questionNumber - 1) % resumeFocus.length];
  }
  // mixed
  if (position <= 0.3) return "background, motivation, and role fit";
  if (position <= 0.6) return "a specific technical project or skill from resume";
  if (position <= 0.8) return "system design or a real technical challenge";
  return "career goals and future plans";
};


const isGarbageAnswer = (answer) => {
  const trimmed = answer.trim();
  // Too short (less than 3 words or less than 10 characters)
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < 3 || trimmed.length < 10) return true;
  // Only symbols/numbers/punctuation, no real words
  const hasRealWords = /[a-zA-Z]{3,}/.test(trimmed);
  if (!hasRealWords) return true;
  // Single generic filler words like "ok", "yes", "no", "idk"
  const fillerOnly = /^(ok|okay|yes|no|nope|idk|sure|hmm|uh|um|fine|done|good|bad|maybe|lol|haha|na|nah|hello|hi|hey)$/i.test(trimmed);
  if (fillerOnly) return true;
  return false;
};

const evaluateAnswerWithAi = async ({ interview, question, answer }) => {
  // Immediately reject garbage/nonsense answers without calling AI
  if (isGarbageAnswer(answer)) {
    return {
      score: 0,
      feedback: "The answer does not address the question at all. Please provide a meaningful and relevant response.",
      strengths: [],
      improvements: ["Answer the question with relevant content", "Provide specific examples and details", "Structure your response clearly"]
    };
  }

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  // Fallback score is low — only meaningful correct answers earn points via AI
  const fallbackScore = 0;

  const messages = [
    {
      role: "system",
      content: `You are a very strict interview evaluator. Your job is to score the candidate's answer ONLY if it is BOTH:
1. RELEVANT — directly addresses the interview question asked.
2. MEANINGFUL — contains real knowledge, specific details, or genuine examples. Not vague, filler, or copied fluff.

Return strict JSON only:
{
  "score": 0,
  "feedback": "brief feedback in 1-2 sentences",
  "strengths": ["strength1"],
  "improvements": ["improvement1"]
}

STRICT Scoring rules (0–100 scale):
- Score 0: Answer is irrelevant to the question, random text, off-topic, filler, gibberish, or nonsense. ZERO score — no exceptions.
- Score 1–20: Answer is very loosely related but contains no real substance, knowledge, or examples.
- Score 21–40: Answer is partially on-topic but vague, missing core details, or very generic.
- Score 41–60: Answer is relevant and shows some understanding, but lacks examples or depth.
- Score 61–80: Good answer — relevant, shows knowledge, gives some examples. Minor gaps.
- Score 81–100: Excellent — highly relevant, correct, detailed with specific examples and clear structure.

⚠ CRITICAL RULES:
- If the answer does NOT clearly address the question asked, give score = 0.
- Do NOT reward length. A long irrelevant answer still gets 0.
- Do NOT give any score for generic answers like "I have experience in this" or "I know how to do this" with no detail.
- Score must reflect CORRECTNESS and RELEVANCE to THIS specific question, not effort.`
    },
    {
      role: "user",
      content: JSON.stringify({
        role: interview.role,
        experience: interview.experience,
        type: interview.type,
        question,
        answer
      })
    }
  ];

  try {
    const response = await askAi(messages);
    const parsed = readJson(response, {});
    const aiScore = normalizeScore(parsed.score, fallbackScore);
    return {
      score: aiScore,
      feedback: parsed.feedback || "Answer was not relevant or meaningful enough to earn a score. Please address the question directly with specific examples.",
      strengths: normalizeList(parsed.strengths, aiScore > 40 ? ["Attempted the question"] : []),
      improvements: normalizeList(parsed.improvements, ["Answer the question directly", "Add specific examples and details"])
    };
  } catch (error) {
    console.error("evaluateAnswerWithAi error:", error.message);
    return {
      score: fallbackScore,
      feedback: "Could not evaluate the answer automatically. Please ensure your answer is clear and relevant to the question.",
      strengths: [],
      improvements: ["Answer the question directly", "Add specific examples and details"]
    };
  }
};

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const pdfjslib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const filepath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjslib.getDocument({data:uint8Array}).promise;

    let resumeText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items.map(item => item.str).join(" ");
    resumeText += pageText + "\n";
  }

  resumeText = resumeText
    .replace(/\s+/g, " ")
    .trim();

     const messages = [
    {
      role: "system",
      content: `Extract structured data from resume.

      Return strictly JSON: 
      {
    "role": "string",
    "experience": "string",
    "projects": ["project1", "project2"],
    "skills": ["skill1", "skill2"]
  }
    `
    },
      {
      role: "user",
      content: resumeText
    }
];

let parsed;
try {
  const aiResponse = await askAi(messages);
  parsed = extractJson(aiResponse);
} catch {
  parsed = {};
}
fs.unlinkSync(filepath);

res.json({
  role: parsed.role || "",
  experience: parsed.experience || "",
  projects: normalizeList(parsed.projects),
  skills: normalizeList(parsed.skills),
  resumeText
});


    // ... (further code may be present)
  } catch (error) {
     console.error(error);

      if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

    return res.status(500).json({ message: error.message });
  }
}

const startInterview = async (req, res) => {
  try {
    const { role, experience, type = "mixed", difficulty = "medium", resume = {}, maxQuestions = 5 } = req.body;
    const cleanRole = cleanText(role).slice(0, 120);
    const cleanExperience = cleanText(experience).slice(0, 80);
    const cleanType = allowedTypes.includes(type) ? type : "mixed";
    const cleanDifficulty = allowedDifficulties.includes(difficulty) ? difficulty : "medium";

    if (!cleanRole || !cleanExperience) {
      return res.status(400).json({ message: "Role and experience are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits < 1) {
      return res.status(402).json({ message: "Not enough credits to start an interview" });
    }

    const interview = await Interview.create({
      user: req.userId,
      role: cleanRole,
      experience: cleanExperience,
      type: cleanType,
      difficulty: cleanDifficulty,
      maxQuestions: Math.min(10, Math.max(3, Number(maxQuestions) || 5)),
      resume
    });

    interview.currentQuestion = await createQuestionWithAi(interview);
    await interview.save();

    user.credits = Math.max(0, user.credits - 1);
    await user.save();

    return res.status(201).json({ interview, credits: user.credits });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { answer } = req.body;
    const cleanAnswer = cleanText(answer);

    if (!isValidId(interviewId)) {
      return res.status(400).json({ message: "Invalid interview id" });
    }

    if (!cleanAnswer) {
      return res.status(400).json({ message: "Answer is required" });
    }

    const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;
    if (wordCount > 200) {
      return res.status(400).json({ message: `Answer must be 200 words or less. Your answer has ${wordCount} words.` });
    }

    const interview = await Interview.findOne({ _id: interviewId, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview is already completed" });
    }

    const currentQuestion = interview.currentQuestion || fallbackQuestion(interview);
    const evaluation = await evaluateAnswerWithAi({ interview, question: currentQuestion, answer: cleanAnswer });

    interview.answers.push({
      question: currentQuestion,
      answer: cleanAnswer,
      ...evaluation
    });

    const isComplete = interview.answers.length >= interview.maxQuestions;
    if (isComplete) {
      interview.status = "completed";
      interview.completedAt = new Date();
      interview.currentQuestion = "";
      interview.report = buildReport(interview);
    } else {
      interview.currentQuestion = await createQuestionWithAi(interview);
    }

    await interview.save();

    return res.status(200).json({ interview, complete: isComplete });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!isValidId(interviewId)) {
      return res.status(400).json({ message: "Invalid interview id" });
    }

    const interview = await Interview.findOne({ _id: interviewId, user: req.userId });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "completed";
    interview.completedAt = interview.completedAt || new Date();
    interview.currentQuestion = "";
    interview.report = buildReport(interview);
    await interview.save();

    return res.status(200).json({ interview });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getInterview = async (req, res) => {
  try {
    if (!isValidId(req.params.interviewId)) {
      return res.status(400).json({ message: "Invalid interview id" });
    }

    const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json(interview);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const exportInterview = async (req, res) => {
  try {
    if (!isValidId(req.params.interviewId)) {
      return res.status(400).json({ message: "Invalid interview id" });
    }

    const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.userId }).lean();

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const safeRole = interview.role.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "interview";
    res.setHeader("Content-Disposition", `attachment; filename="${safeRole}-report.json"`);
    return res.status(200).json({
      exportedAt: new Date().toISOString(),
      interview
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("role experience type difficulty status answers report createdAt completedAt maxQuestions");

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  analyzeResume,
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getHistory,
  exportInterview
};

