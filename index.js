const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
const PORT = 8089;
const decodeIDToken = require("./src/authenticateToken");
const { ChatBot } = require("./src/chatBot");
const { UserAPI } = require("./src/userAPI");
// Init App
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chatBot", decodeIDToken, async (req, res) => {
    const result = {};
    result.auth = req.currentUser ? true : false;
    const message = req.body.message;
    const userId = req.currentUser ? req.currentUser.user_id : null;
    await UserAPI.registerUser(userId, req.currentUser);
    result.messages = await ChatBot.handleRequest(message, userId);
    res.send(result);
});

app.use("*", (req, res) => {
    res.status(404).send({
        code: 404,
        error: "not_found",
    });
});

app.listen(PORT, () => console.log(`Server listening on ${8089}`));
