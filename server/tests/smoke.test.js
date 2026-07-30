const assert = require("assert");
const dotenv = require("dotenv");

dotenv.config();

const { readJson } = require("../services/openRouter.services");
const Interview = require("../models/interview.model");

require("../routes/auth.route");
require("../routes/user.route");
require("../routes/interview.route");
require("../routes/payment.route");

assert.strictEqual(readJson('```json\n{"ok":true}\n```').ok, true);
assert.strictEqual(Boolean(process.env.JWT_SECRET || process.env.SECRET_KEY), true, "JWT secret is missing");
assert.strictEqual(Boolean(process.env.MONGO_DB || process.env.mango_url), true, "MongoDB URL is missing");
assert.strictEqual(Boolean(process.env.RAZORPAY_KEY_ID), true, "Razorpay key id is missing");
assert.strictEqual(Boolean(process.env.RAZORPAY_KEY_SECRET), true, "Razorpay key secret is missing");
assert.strictEqual(typeof Interview.schema.paths.role.path, "string");
assert.strictEqual(typeof Interview.schema.paths.answers.path, "string");

console.log("Smoke tests passed");
