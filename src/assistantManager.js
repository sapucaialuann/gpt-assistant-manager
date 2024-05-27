require("dotenv").config();
const axios = require("axios");
const Logger = require("./logger");

class AssistantManager {
  constructor() {
    this.assistants = {};
    this.logger = new Logger();
  }

  addAssistant(name, role) {
    this.assistants[name] = { role };
  }

  removeAssistant(name) {
    delete this.assistants[name];
  }

  listAssistants() {
    return this.assistants;
  }

  async sendMessage(from, to, message) {
    if (!this.assistants[to]) {
      return { error: "Assistant not found." };
    }
    const response = await this.queryGPT(to, message, this.assistants[to].role);
    this.logger.log(from, to, message);
    this.logger.log(to, from, response);
    return { from: to, message: response };
  }

  async conference(from, toList, message) {
    for (const to of toList) {
      if (!this.assistants[to]) {
        return { error: `Assistant ${to} not found.` };
      }
    }
    let combinedResponse = "";
    for (const to of toList) {
      const response = await this.queryGPT(
        to,
        message,
        this.assistants[to].role
      );
      combinedResponse += `${to}: ${response}\n`;
      this.logger.log(from, to, message);
      this.logger.log(to, from, response);
    }
    return { from: "Conference", message: combinedResponse };
  }

  async queryGPT(assistantName, message, role) {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = "https://api.openai.com/v1/chat/completions";
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: role },
          { role: "user", content: message },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  }
}

module.exports = AssistantManager;
