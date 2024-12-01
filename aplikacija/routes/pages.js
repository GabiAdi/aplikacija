const express = require("express");
const auth = require("../controllers/auth")

const router = express.Router();

// Postavljanje rute za pocetnu stranicu
router.get("/", auth.loggedIn, (req, res) => {
    // Ako je korisnik ulogiran prikazuje stranicu index.hbs bez opcije za ulogirati/registrirati
    // Inace prikazuje stranicu gdje se moguce logirati
    if(req.user) {
        res.render("index", {loggedIn: "true", username: req.user.name});
    } else {
        res.render("index");
    }
});

// Postavljanje rute za stranicu za registriranje
router.get("/register", auth.loggedIn, (req, res) => {
    // Ako je korisnik logiran, preusmjeruje ga prema pocetnoj stranici
    // Inace mu dopusta registraciju
    if(req.user) {
        res.redirect("/");
    } else {
        res.render("register");
    }
});

router.get("/login", auth.loggedIn, (req, res) => {
    // Ako je korisnik logiran, preusmjeruje ga prema pocetnoj stranici
    // Inace mu dopusta ulogiranje
    if(req.user) {
        res.redirect("/");
    } else {
        res.render("login");
    }
});

// Odlogiranje
router.get("/logout", auth.logout, (req, res) => {
    res.render("index");
});

module.exports = router;
