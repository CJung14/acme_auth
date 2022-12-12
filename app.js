const express = require("express");
const app = express();
const {
  models: { User, Note },
} = require("./db");
const path = require("path");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// middleware
app.use(express.json());
// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.post("/api/auth", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (isValid) {
      const token = await jwt.sign({ userId: user.id }, process.env.JWT);
      res.send({ token: token });
    } else {
      console.error("WRONG PASSWORD");
    }
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

app.get("/api/users/:id/notes", async (req, res, next) => {
  try {
    const userToken = await jwt.verify(
      req.headers.authorization,
      process.env.JWT
    );
    const user = await User.findOne({
      where: { id: userToken.userId },
      include: { model: Note },
    });
    res.send(user.notes);
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
