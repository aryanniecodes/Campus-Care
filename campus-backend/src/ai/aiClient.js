const { OpenAI } = require("openai");

let openai = null;

if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.error("Failed to initialize OpenAI client:", error.message);
    openai = null;
  }
}

module.exports = openai;
