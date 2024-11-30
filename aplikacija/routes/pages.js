const express = require("express");
const auth = require("../controllers/auth")

const router = express.Router();

router.get("/", auth.loggedIn, (req, res) => {
    if(req.user) {
        res.render("index", {loggedIn: "true", username: req.user.name});
    } else {
        res.render("index");
    }
});

router.get("/register", auth.loggedIn, (req, res) => {
    if(req.user) {
        //res.render("index", {loggedIn: "true", username: req.user.name});
        res.redirect("/");
    } else {
        res.render("register");
    }
});

router.get("/login", auth.loggedIn, (req, res) => {
    if(req.user) {
        //res.render("index", {loggedIn: "true", username: req.user.name});
        res.redirect("/");
    } else {
        res.render("login");
    }
});

router.get("/logout", auth.logout, (req, res) => {
    res.render("index");
});

module.exports = router;
