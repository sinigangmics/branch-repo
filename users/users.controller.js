const express = require("express");
const router = express.Router();
const Joi = require("joi");
const db = require("_helpers/db");
const validateRequest = require("_middleware/validate-request");

const userService = require("./user.service");

// routes

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", createSchema, create);
router.put("/:id", updateSchema, update);
router.delete("/:id", _delete);

module.exports = router;

// route functions

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  const user = await db.User.findOne({
    where: { username },
    attributes: { include: ["passwordHash"] }, // Include passwordHash in the result
  });

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Successful login
  return res.status(200).json({ message: "Login successful", user });
});

router.post("/logout", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  const user = await db.User.findOne({
    where: { username },
    attributes: { include: ["passwordHash"] }, // Include passwordHash in the result
  });

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Successful login
  return res.status(200).json({ message: "Logout successful", user });
});

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => res.json(user))
    .catch(next);
}

function create(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({ message: "User created" }))
    .catch(next);
}

function update(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({ message: "User updated" }))
    .catch(next);
}

function _delete(req, res, next) {
  userService
    .delete(req.params.id)
    .then(() => res.json({ message: "User deleted" }))
    .catch(next);
}

// schema functions

function createSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().empty(""),
    username: Joi.string().empty(""),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }).with("password", "confirmPassword");
  validateRequest(req, next, schema);
}
