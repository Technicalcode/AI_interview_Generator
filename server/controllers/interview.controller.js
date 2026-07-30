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
  const prompts = {
    hr: `Tell me about a time you handled a challenging situation while working as a ${role}.`,
    technical: `Explain one important ${role} concept you have used in a real project.`,
    resume: `Pick one project from your resume and explain your exact contribution, challenges, and result.`,
    mixed: `For a ${experience} ${role} role, explain a project or experience that proves you are ready for this job.`
  };

  return prompts[type] || prompts.mixed || `Question ${questionNumber}: Tell me about your experience as a ${role}.`;
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
  const messages = [
    {
      role: "system",
      content: `You create concise interview questions. Return strict JSON only:
{
  "question": "one clear question"
}`
    },
    {
      role: "user",
      content: JSON.stringify({
        role: interview.role,
        experience: interview.experience,
        type: interview.type,
        difficulty: interview.difficulty,
        questionNumber,
        previousQuestions: interview.answers.map((item) => item.question),
        resume: interview.resume
      })
    }
  ];

  try {
    const response = await askAi(messages);
    const parsed = readJson(response, {});
    return parsed.question || fallbackQuestion(interview, questionNumber);
  } catch {
    return fallbackQuestion(interview, questionNumber);
  }
};

const evaluateAnswerWithAi = async ({ interview, question, answer }) => {
  const fallbackScore = Math.min(85, Math.max(45, answer.trim().split(/\s+/).length * 3));

  const messages = [
    {
      role: "system",
      content: `Evaluate an interview answer. Return strict JSON only:
{
  "score": 0,
  "feedback": "short feedback",
  "strengths": ["strength"],
  "improvements": ["improvement"]
}

Important: score must be on a 0-100 scale, not 0-10.`
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
    return {
      score: normalizeScore(parsed.score, fallbackScore),
      feedback: parsed.feedback || "Good attempt. Add more concrete examples and measurable impact to strengthen the answer.",
      strengths: normalizeList(parsed.strengths, ["Relevant answer"]),
      improvements: normalizeList(parsed.improvements, ["Use a clearer structure", "Add specific examples"])
    };
  } catch {
    return {
      score: fallbackScore,
      feedback: "Good attempt. Add more concrete examples, context, and outcomes to make the answer stronger.",
      strengths: ["Relevant answer"],
      improvements: ["Use a clearer structure", "Add specific examples"]
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

