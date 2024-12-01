const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

// Za registraciju
exports.register = (req, res) => {
    // Dohvacamo unos korisnika
    const { name, password, passwordConfirm } = req.body;

    // Ako bilo koje polje nije popunjeno vracamo gresku 
    if(!name || !password || !passwordConfirm) {
        return res.render("register", {
            message: "Popunite sva polja",
            class: "alert-danger"
        });
    }

    // Upit bazi podataka ako vec postoji koristeni username
    db.query("SELECT name FROM users WHERE name = ?", [name], async (err, result) => {
        if(err) {
            console.log(err);
        }
        
        // Ako postoji vracamo gresku
        if(result.length > 0) {
            return res.render("register", {
                message: "Korisničko ime je zauzeto",
                class: "alert-danger"
            });
        }
        // Ako se lozinka ne podudara s ponovljenom lozinkom vracamo gresku
        if (password !== passwordConfirm) {
            return res.render("register", {
                message: "Lozinke se ne podudaraju",
                class: "alert-danger"
            });
        }

        // Napravimo hash lozinke
        let hashedPassword = await bcrypt.hash(password, 8);
        
        // Spremamo lozinku i username u bazu podataka
        db.query("INSERT INTO users SET ?", {name: name, password: hashedPassword}, (err, result) => {
            if(err) {
                console.log(err);
            } else {
                return res.render("register", {
                    message: "Korisnik registriran",
                    class: "alert-success"
                });
            }
        });

    });
};

exports.login = (req, res) => {
    // Dohvacamo username i lozinku s web stranice
    const { name, password } = req.body;

    // Ako je bilo koje polje prazno vracamo gresku
    if(!name || !password) {
        return res.render("register", {
            message: "Popunite sva polja"
        });
    }

    // Upit bazi podataka ako postoji username
    db.query("SELECT * FROM users WHERE name = ?", [name], async (err, result) => {
        if(err) {
            console.log(err);
        }
        // Ako ne postoji username ili lozinka nije tocna vracamo gresku
        if(!result[0] || !await bcrypt.compare(password, result[0].password)) {
            return res.render("login", {
                message: "Netočno korisničko ime ili lozinka",
                class: "alert-danger"
            });
        } else {
            // Token za cookie
            const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
                expiresIn:process.env.JWT_EXPIRES,
            });
            // Postavke cookiea
            const cookieOptions = {
                expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly:true
            }
            // Postavljamo cookie za ulogiranog korisnika (tako mozemo provjeriti je li korisnik vec ulogiran)
            res.cookie("user", token, cookieOptions);
            return res.redirect("/")
        }
    });

};

// Provjera je li korisnik ulogiran
exports.loggedIn = async (req, res, next) => {
    // Ako ne postoji cookie za ulogiran korisnika ne pokusavamo ga provjeriti
    if(!req.cookies.user) {
        return next();
    }
    try {
        // Dekodirani cookie
        const decoded = await jwt.verify(req.cookies.user, process.env.JWT_SECRET);

        // Provjeravamo postoji li navedeni korisnik u BP
        db.query("SELECT * FROM users WHERE id = ?", [decoded.id], (err, result) => {
            if(err) {
                return next();
            }
            // Ako postoji mozemo prikazati odgovarajuce web stranice
            req.user = result[0];
            return next();
        });
    } catch (err) {
        if(err) {
            return next();
        }
    }
};

// Logout
exports.logout = (req, res) => {
    // Izbrise user cookie i preusmjerava na pocetnu stranicu 
    res.clearCookie("user");
    res.redirect("/");
};
