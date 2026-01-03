require("dotenv").config();
const inquirer = require("inquirer");
const bcrypt = require("bcryptjs");
const { connectDB } = require("../lib/db");
const { User } = require("../models/user.model");

async function promptUserDetails() {
  return inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter name:",
      validate: (input) => (input ? true : "name is required"),
    },
    {
      type: "input",
      name: "email",
      message: "Enter email:",
      validate: (input) =>
        /\S+@\S+\.\S+/.test(input) ? true : "Enter a valid email",
    },
    {
      type: "password",
      name: "password",
      message: "Enter password:",
      mask: "*",
      validate: (input) =>
        input.length >= 6 ? true : "Password must be at least 6 characters",
    },
  ]);
}

async function createUser(name, email, password) {
  try {
    await connectDB();
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash: hashed,
      role: "creator",
    });
    await user.save();
    console.log("✅ User created successfully");
  } catch (err) {
    console.error("❌ Error creating user:", err);
  }
}

async function main() {
  const { name, email, password } = await promptUserDetails();
  await createUser(name, email, password);
  process.exit(0);
}

main();
