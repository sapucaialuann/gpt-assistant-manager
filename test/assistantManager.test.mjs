import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import AssistantManager from "../src/assistantManager.js";
import { expect } from "chai";

const app = express();
const assistantManager = new AssistantManager();

app.use(bodyParser.json());

app.post("/add-assistant", (req, res) => {
  const { name, role } = req.body;
  assistantManager.addAssistant(name, role);
  res.send({ message: `Assistant ${name} with role ${role} added.` });
});

app.post("/send-message", async (req, res) => {
  const { from, to, message } = req.body;
  const response = await assistantManager.sendMessage(from, to, message);
  res.send(response);
});

describe("Assistant Manager API", () => {
  it('should create an assistant called "testo1" with the role "software developer"', (done) => {
    request(app)
      .post("/add-assistant")
      .send({ name: "testo1", role: "software developer" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.equal(
          "Assistant testo1 with role software developer added."
        );
        done();
      });
  });

  it('should send a message to "testo1" asking how to code hello world in HTML', function (done) {
    this.timeout(10000); // Set timeout to 10 seconds
    request(app)
      .post("/send-message")
      .send({
        from: "user",
        to: "testo1",
        message: "tell me how to code hello world in html",
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.from).to.equal("testo1");
        expect(res.body.message).to.include("<!DOCTYPE html>");
        done();
      });
  });
});
