const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

exports.register = (req, res) => {
    const { name, password, passwordConfirm } = req.body;

    db.query("SELECT name FROM users WHERE name = ?", [name], async (err, ret) => {
        if(err) {
            console.log(err);
        }
            
        if(ret.length > 0) {
            return res.render("register", {
                message: "Korisničko ime je zauzeto"
            });
        } else if (password !== passwordConfirm) {
            return res.render("register", {
                message: "Lozinke se ne podudaraju"
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        
        db.query("INSERT INTO users SET ?", {name: name, password: hashedPassword}, (err, ret) => {
            if(err) {
                console.log(err);
            } else {
                return res.render("register", {
                    message: "Korisnik registriran"
                });
            }
        });

    });
};

exports.login = async (req, res) => {
    const { name, password } = req.body;

    let hashedPassword = await bcrypt.hash(password, 8);

    console.log(name, password);

    db.query("SELECT name,password FROM users WHERE name = ?", [name], (err, ret) => {
        if(err) {
            return res.render("login", {
                message: "Netočno korisničko ime ili lozinka"
            });
        }

        if(ret.length > 0) {
            console.log(ret[0].password, hashedPassword);
            if(ret[0].password === hashedPassword) {
                return res.render("login", {
                    message: "Ulogirano"
                });
            }
        }
    });

};