const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  role: { type: String, default: "" },
  experience: { type: String, default: "" },
  projects: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  resumeText: { type: String, default: "" }
}, { _id: false });

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  score: { type: Number, default: 0 },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  overallScore: { type: Number, default: 0 },
  summary: { type: String, default: "" },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  recommendedTopics: { type: [String], default: [] }
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ["hr", "technical", "resume", "mixed"],
    default: "mixed"
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["in_progress", "completed"],
    default: "in_progress"
  },
  currentQuestion: {
    type: String,
    default: ""
  },
  maxQuestions: {
    type: Number,
    default: 5
  },
  resume: {
    type: resumeSchema,
    default: () => ({})
  },
  answers: {
    type: [answerSchema],
    default: []
  },
  report: {
    type: reportSchema,
    default: () => ({})
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Interview", interviewSchema);
