const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  create,
  getBranch,
  delete: _delete,
  assignUserToBranch,
  update,
};

async function getAll() {
  return await db.Branches.findAll();
}

async function getBranch(id) {
  const branch = await db.Branches.findByPk(id);
  if (!branch) throw "branch not found";
  return branch;
}

async function create(params) {
  const branch = new db.Branches(params);
  await branch.save();
}

async function update(id, params) {
  const branch = await getBranch(id);
  console.log("Initial branch status:", branch.status);

  // validate
  const branchChanged = branch.branch !== params.branch;
  const statusChanged = branch.status !== params.status;

  if (
    branchChanged &&
    (await db.Branches.findOne({ where: { branch: params.branch } }))
  ) {
    console.log('Branch "' + params.branch + '" is already registered');
  }

  if (statusChanged) {
    console.log("Before setting status:", branch.status);

    branch.status = params.status;
    console.log("After setting status:", branch.status);
  } else {
    console.log('Status "' + branch.status + '" is already registered');
  }

  // copy params to user and save

  Object.assign(branch, params);
  await branch.save();
}

async function assignUserToBranch(user, branch) {
  const branchId = req.params.branchId;
  const userId = req.params.userId;

  try {
    // Check if the branch and user exist in the database
    const branch = await db.Branch.findByPk(branchId);
    const user = await db.User.findByPk(userId);

    if (!branch || !user) {
      return res.status(404).json({ message: "Branch or user not found" });
    }

    // Assign the user to the branch (update the database accordingly)
    await assignUserToBranch(user, branch);

    // Respond with a success message
    return res
      .status(200)
      .json({ message: "User assigned to branch successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  console.log(`User ${user.id} assigned to Branch ${branch.id}`);
}

async function _delete(id) {
  const branch = await getBranch(id);
  await branch.destroy();
}
