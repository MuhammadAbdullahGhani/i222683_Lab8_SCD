require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());
let users = [];
let events = [];
const SECRET_KEY = "ksdhjfbkhdsbfhks";

app.get("/", (req, res) => {
  res.send("🎉 Event Planner API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, email, password: hashedPassword };
    users.push(newUser);
  
    res.status(201).json({ message: "User registered successfully" });
  });
  
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  });
  
  const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });
  
    try {
      const verified = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid token" });
    }
  };

  app.get("/api/events", authMiddleware, (req, res) => {
    const { sortBy } = req.query; // Accept sorting criteria from query params
    let userEvents = events.filter(event => event.userId === req.user.userId);
  
    if (sortBy === "date") {
      userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "category") {
      userEvents.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "reminder") {
      userEvents.sort((a, b) => b.reminder - a.reminder); // Sort by reminder status (true first)
    }
  
    res.json(userEvents);
  });
  
app.post("/api/events", authMiddleware, (req, res) => {
    const { name, description, date, category, reminder } = req.body;
  
    const newEvent = {
      id: events.length + 1,
      userId: req.user.userId,
      name,
      description,
      date: new Date(date),
      category,
      reminder: reminder || false,
    };
  
    events.push(newEvent);
    res.status(201).json(newEvent);
  });

  app.get("/api/events", authMiddleware, (req, res) => {
    const userEvents = events.filter(event => event.userId === req.user.userId);
    res.json(userEvents);
  });

  const cron = require("node-cron");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
cron.schedule("*/30 * * * *", () => {
  const now = new Date();
  events.forEach(event => {
    if (event.reminder && new Date(event.date) - now <= 3600000) { 
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "abdullaghani206@gmail.com",
        subject: `Reminder: ${event.name}`,
        text: `Your event "${event.name}" is happening soon.`,
      });
    }
  });
});

  