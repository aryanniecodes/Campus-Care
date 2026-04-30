const openai = require("./aiClient");
const logger = require("../utils/logger");

/**
 * Generates a professional email message using AI.
 * Fallbacks to a simple message if AI is unavailable or fails.
 */
const generateEmail = async (title, category) => {
  // If AI client is not initialized, use fallback immediately
  if (!openai) {
    return `New task assigned: ${title}`;
  }

  try {
    const prompt = `Generate a very short professional email notification for a maintenance worker about a new task.
    Task Title: ${title}
    Worker Role: ${category}
    Return ONLY the email body text. One sentence preferred.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a maintenance dispatcher." }, { role: "user", content: prompt }],
      max_tokens: 50,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    logger.error("AI Email Generation error:", error.message);
    return `New task assigned: ${title}`;
  }
};

module.exports = generateEmail;
