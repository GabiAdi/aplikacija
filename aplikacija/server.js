const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");

dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

/*app.use(session({
    secret: process.env.S_SECRET,
    resave: true,
    saveUninitialized: true,
}));*/

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

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
