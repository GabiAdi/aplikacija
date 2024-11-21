const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "./.env" });

const app = express();
const port = 3030;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine" , "hbs");

db.connect( (err) => {
    if(err) {
        console.log(err);
    }else {
        console.log("MySQL db connected")
    }
});

const expressServer = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
