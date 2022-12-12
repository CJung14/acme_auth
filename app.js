const express = require("express");
const app = express();
const {
  models: { User },
} = require("./db");
const path = require("path");
require("dotenv").config();
const jwt = require("jsonwebtoken");

console.log(process.env.JWT);

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    const user = await User.findAll({
      where: {
        username: req.body.username,
        password: req.body.password,
      },
    });
    const token = await jwt.sign({ userId: user[0].id }, process.env.JWT);
    res.send({ token: token });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    const userToken = await jwt.verify(
      req.headers.authorization,
      process.env.JWT
    );
    const user = await User.findByPk(userToken.userId);
    res.send(user);
  } catch (ex) {
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
