const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: '../.env' });

const app = express();
const port = 3030;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

db.connect( (error) => {
    if(error) {
        console.log(error);
    }else {
        console.log("MySQL db connected")
    }
});

const expressServer = app.listen(port, () => {
    console.log("Listening on port ${port}");
});

app.get("/", function(req, res) {
    res.send("Lets go!");
});
