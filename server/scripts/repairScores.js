const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Interview = require("../models/interview.model");

dotenv.config();

const uri = process.env.MONGO_DB || process.env.mango_url;

const repairScores = async () => {
  if (!uri) {
    throw new Error("MongoDB URL is missing");
  }

  await mongoose.connect(uri);
  const interviews = await Interview.find({ "answers.score": { $gt: 0, $lte: 10 } });
  let updated = 0;

  for (const interview of interviews) {
    let changed = false;

    for (const answer of interview.answers) {
      if (answer.score > 0 && answer.score <= 10) {
        answer.score = Math.round(answer.score * 10);
        changed = true;
      }
    }

    if (changed) {
      const answered = interview.answers.filter((item) => item.answer && item.answer.trim());
      const average = answered.length
        ? Math.round(answered.reduce((sum, item) => sum + Number(item.score || 0), 0) / answered.length)
        : 0;

      interview.report = {
        ...(interview.report?.toObject ? interview.report.toObject() : interview.report),
        overallScore: average,
        summary: answered.length
          ? `You completed ${answered.length} ${interview.type} interview questions for ${interview.role}. Your overall score is ${average}/100.`
          : "No answers were submitted for this interview."
      };

      await interview.save();
      updated += 1;
    }
  }

  console.log(`updatedInterviews=${updated}`);
};

repairScores()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
