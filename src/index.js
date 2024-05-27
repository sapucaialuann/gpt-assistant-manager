const express = require("express");
const bodyParser = require("body-parser");
const AssistantManager = require("./assistantManager");
const readline = require("readline");

const app = express();
const PORT = process.env.PORT || 3000;
const assistantManager = new AssistantManager();

app.use(bodyParser.json());

app.post("/add-assistant", (req, res) => {
  const { name, role } = req.body;
  assistantManager.addAssistant(name, role);
  res.send({ message: `Assistant ${name} with role ${role} added.` });
});

app.post("/remove-assistant", (req, res) => {
  const { name } = req.body;
  assistantManager.removeAssistant(name);
  res.send({ message: `Assistant ${name} removed.` });
});

app.get("/list-assistants", (req, res) => {
  const assistants = assistantManager.listAssistants();
  res.send(assistants);
});

app.post("/send-message", async (req, res) => {
  const { from, to, message } = req.body;
  const response = await assistantManager.sendMessage(from, to, message);
  res.send(response);
});

app.post("/conference", async (req, res) => {
  const { from, to, message } = req.body;
  const response = await assistantManager.conference(from, to, message);
  res.send(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  showMenu();
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const showMenu = () => {
  console.log(`
    1. Add Assistant
    2. Remove Assistant
    3. List Assistants
    4. Send Message
    5. Conference
    6. Exit
  `);
  rl.question("Select an option: ", handleMenu);
};

const handleMenu = (option) => {
  switch (option.trim()) {
    case "1":
      addAssistant();
      break;
    case "2":
      removeAssistant();
      break;
    case "3":
      listAssistants();
      break;
    case "4":
      sendMessage();
      break;
    case "5":
      startConference();
      break;
    case "6":
      rl.close();
      process.exit(0);
      break;
    default:
      console.log("Invalid option, please try again.");
      showMenu();
      break;
  }
};

const addAssistant = () => {
  rl.question("Enter assistant name: ", (name) => {
    rl.question("Enter assistant role: ", (role) => {
      assistantManager.addAssistant(name, role);
      console.log(`Assistant ${name} with role "${role}" added.`);
      showMenu();
    });
  });
};

const removeAssistant = () => {
  const assistants = assistantManager.listAssistants();
  const assistantNames = Object.keys(assistants);
  if (assistantNames.length === 0) {
    console.log("No assistants to remove.");
    return showMenu();
  }
  console.log("Select an assistant to remove:");
  assistantNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  rl.question("Enter number: ", (number) => {
    const index = parseInt(number.trim()) - 1;
    if (index >= 0 && index < assistantNames.length) {
      const name = assistantNames[index];
      assistantManager.removeAssistant(name);
      console.log(`Assistant ${name} removed.`);
    } else {
      console.log("Invalid selection.");
    }
    showMenu();
  });
};

const listAssistants = () => {
  const assistants = assistantManager.listAssistants();
  console.log("Current assistants:", assistants);
  showMenu();
};

const sendMessage = () => {
  const assistants = assistantManager.listAssistants();
  const assistantNames = Object.keys(assistants);
  if (assistantNames.length === 0) {
    console.log("No assistants available to send messages.");
    return showMenu();
  }
  console.log("Select an assistant to send message to:");
  assistantNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  rl.question("Enter number: ", (number) => {
    const index = parseInt(number.trim()) - 1;
    if (index >= 0 && index < assistantNames.length) {
      const to = assistantNames[index];
      rl.question("Enter message: ", async (message) => {
        const response = await assistantManager.sendMessage(
          "user",
          to,
          message
        );
        console.log("Response:", response);
        showMenu();
      });
    } else {
      console.log("Invalid selection.");
      showMenu();
    }
  });
};

const startConference = () => {
  const assistants = assistantManager.listAssistants();
  const assistantNames = Object.keys(assistants);
  if (assistantNames.length === 0) {
    console.log("No assistants available for a conference.");
    return showMenu();
  }
  console.log(
    "Select assistants to conference with (comma separated numbers):"
  );
  assistantNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  rl.question("Enter numbers: ", (numbers) => {
    const indexes = numbers.split(",").map((num) => parseInt(num.trim()) - 1);
    const toList = indexes
      .map((index) => assistantNames[index])
      .filter((name) => name);
    if (toList.length === 0) {
      console.log("Invalid selection.");
      return showMenu();
    }
    rl.question("Enter message: ", async (message) => {
      const response = await assistantManager.conference(
        "user",
        toList,
        message
      );
      console.log("Response:", response);
      showMenu();
    });
  });
};
