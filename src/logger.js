const fs = require("fs");
const path = require("path");

class Logger {
  constructor() {
    this.logFilePath = path.join(__dirname, "..", "conversations.txt");
  }

  log(from, to, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${from} to ${to}: ${message}\n`;
    fs.appendFileSync(this.logFilePath, logEntry);
  }
}

module.exports = Logger;
