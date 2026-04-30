const openai = require("./aiClient");
const logger = require("../utils/logger");

/**
 * Classifies a complaint into a category using AI.
 * Fallbacks to keyword logic if AI is unavailable or fails.
 */
const classifyComplaint = async (title, description) => {
  // If AI client is not initialized, use fallback immediately
  if (!openai) {
    return fallbackLogic(title, description);
  }

  try {
    const prompt = `Classify this campus maintenance complaint into one category: electrician, plumber, cleaner, mess, or other. 
    Complaint Title: ${title}
    Complaint Description: ${description}
    Return ONLY the category name in lowercase.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a maintenance dispatcher." }, { role: "user", content: prompt }],
      max_tokens: 10,
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    const validCategories = ["electrician", "plumber", "cleaner", "mess", "other"];
    
    return validCategories.includes(category) ? category : "other";
  } catch (error) {
    logger.error("AI Classification error:", error.message);
    return fallbackLogic(title, description);
  }
};

// Fallback logic extracted for reuse
const fallbackLogic = (title, description) => {
  const text = (title + " " + description).toLowerCase();
  if (text.includes("fan") || text.includes("light")) return "electrician";
  if (text.includes("water") || text.includes("leakage")) return "plumber";
  if (text.includes("cleaning")) return "cleaner";
  if (text.includes("food") || text.includes("mess")) return "mess";
  return "other";
};

module.exports = classifyComplaint;
