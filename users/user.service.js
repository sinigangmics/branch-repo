const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function getAll() {
  return await db.User.findAll();
}

async function getById(id) {
  return await getUser(id);
}

async function create(params) {
  // validate
  if (await db.User.findOne({ where: { email: params.email } })) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const user = new db.User(params);

  // hash password
  // user.passwordHash = await bcrypt.hash(params.password, 10);
  user.passwordHash = params.password;
  // save user
  await user.save();
}

async function update(id, params) {
  const user = await getUser(id);

  // validate
  const emailChanged = params.email && user.email !== params.email;
  if (
    emailChanged &&
    (await db.User.findOne({ where: { email: params.email } }))
  ) {
    throw 'Email "' + params.email + '" is already registered';
  }

  // hash password if it was entered
  if (params.password) {
    // params.passwordHash = await bcrypt.hash(params.password, 10);
    params.passwordHash = params.password;
  }

  // copy params to user and save
  Object.assign(user, params);
  await user.save();
}

async function _delete(id) {
  const user = await getUser(id);
  await user.destroy();
}

// helper functions

async function getUser(id) {
  const user = await db.User.findByPk(id);
  if (!user) throw "User not found";
  return user;
}

// async function loginUser(params) {
//   const { username, password } = params.body;

//   if (!username || !password) {
//     return res.status(400).json({ error: "Missing username or password" });
//   }

//   if (!user[username] || user[username].password !== password) {
//     return res.status(401).json({ error: "Invalid credentials" });
//   }

//   // Authentication successful
//   res.json({ message: "Login successful" });
// }

// async function logoutUser(params) {
//   const user = new db.User(params);

//   user.passwordHash = params.password;
//   // save user
//   await user.save();
// }
