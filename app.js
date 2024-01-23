require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { body,validationResult } = require('express-validator');

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB successfully");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

const LoginSchema = new mongoose.Schema({
    email: String,
    password: String
});

const collection = new mongoose.model("signups", LoginSchema);

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// All GET methods
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});

// Collecting signup users
app.post("/signup",[
    body('name'),
    body('password','Password must be atleast 8 characters').isLength({min:8}),
], async (req, res) => {

    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }


    const myData = new collection(req.body);

    const email = req.body.email.trim();
    if (/[A-Z]/.test(email)) {
        return res.render("signup", { errorMessage: "Email should not contain uppercase letters" });
    }

    const password = req.body.password.trim();
    if (password.length < 8) {
        return res.render("signup", { errorMessage: "Password must contain 8 characters" });
    }
    if (!password.includes("@")) {
        return res.render("signup", { errorMessage: "Password must contain '@'" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    myData.password = hashedPassword;

    // Checking if the user already exists in the database
    const existingUser = await collection.findOne({ email: myData.email });
    if (existingUser) {
        res.render("signup", { errorMessage: "User already exists" });
    } else {
        myData.save();
        res.redirect("/signin");
    }
});

// Login users
app.post("/signin", async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
            return res.render("signin", { errorMessage: "User not found" });
        }

        // Compare hashed password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);

        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.render("signin", { errorMessage: "Wrong password" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.render("signin", { errorMessage: "An error occurred during login. Please try again." });
    }
});

const port = process.env.PORT || 1000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
