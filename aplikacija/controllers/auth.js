const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

exports.register = (req, res) => {
    const { name, password, passwordConfirm } = req.body;

    if(!name || !password || !passwordConfirm) {
        return res.render("register", {
            message: "Popunite sva polja",
            class: "alert-danger"
        });
    }

    db.query("SELECT name FROM users WHERE name = ?", [name], async (err, result) => {
        if(err) {
            console.log(err);
        }
            
        if(result.length > 0) {
            return res.render("register", {
                message: "Korisničko ime je zauzeto",
                class: "alert-danger"
            });
        } else if (password !== passwordConfirm) {
            return res.render("register", {
                message: "Lozinke se ne podudaraju",
                class: "alert-danger"
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        
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
    const { name, password } = req.body;

    if(!name || !password) {
        return res.render("register", {
            message: "Popunite sva polja"
        });
    }

    db.query("SELECT * FROM users WHERE name = ?", [name], async (err, result) => {
        if(err) {
            console.log(err);
        }
        if(!result[0] || !await bcrypt.compare(password, result[0].password)) {
            return res.render("login", {
                message: "Netočno korisničko ime ili lozinka",
                class: "alert-danger"
            });
        } else {
            //console.log(result);
            const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
                expiresIn:process.env.JWT_EXPIRES,
            });
            const cookieOptions = {
                expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly:true
            }
            res.cookie("user", token, cookieOptions);
            return res.redirect("/")
        }
    });

};

exports.loggedIn = async (req, res, next) => {
    if(!req.cookies.user) {
        return next();
    }
    try {
        const decoded = await jwt.verify(req.cookies.user, process.env.JWT_SECRET);
        db.query("SELECT * FROM users WHERE id = ?", [decoded.id], (err, result) => {
            if(err) {
                return next();
            }
            req.user = result[0];
            return next();
        });
    } catch (err) {
        if(err) {
            //console.log(err);
            return next();
        }
    }
};

exports.logout = (req, res) => {
    res.clearCookie("user");
    res.redirect("/");
};
