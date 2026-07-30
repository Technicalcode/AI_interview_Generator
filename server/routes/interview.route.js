const express = require("express");
const isAuth = require("../middlewares/isAuth")
const {
    analyzeResume,
    startInterview,
    submitAnswer,
    completeInterview,
    getInterview,
    getHistory,
    exportInterview
} = require("../controllers/interview.controller")
const { upload } = require("../middlewares/multer")


const interviewRouter = express.Router();

interviewRouter.post("/analyze-resume", isAuth, upload.single("resume"), analyzeResume)
interviewRouter.post("/start", isAuth, startInterview)
interviewRouter.get("/history", isAuth, getHistory)
interviewRouter.get("/:interviewId/export", isAuth, exportInterview)
interviewRouter.get("/:interviewId", isAuth, getInterview)
interviewRouter.post("/:interviewId/answer", isAuth, submitAnswer)
interviewRouter.post("/:interviewId/complete", isAuth, completeInterview)

module.exports = interviewRouter;




