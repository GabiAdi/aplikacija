const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config({ path: "./.env" }); // tajni podaci u .env datoteci

const app = express();
const port = process.env.PORT;

// Spajanje s MySQL bazom podataka
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

const publicDirectory = path.join(__dirname, "./public"); 
app.use(express.static(publicDirectory)); // Postavi ./public folder kao javno dostupan

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.set("view engine" , "hbs");

// Spajanje s MySQL bazom podataka
db.connect( (err) => {
    if(err) {
        console.log(err);
    }else {
        console.log("MySQL db connected")
    }
});

// Pokreni server
const expressServer = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Koristenje drugih javascript datoteka za druge stranice
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
