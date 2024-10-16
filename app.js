const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth'); 

dotenv.config({ path: './.env' });

const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

app.set('view engine', 'hbs');


app.use(authMiddleware); 


db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MYSQL Connected...");
    }
});


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/course", (req, res) => {
    res.render("course");
});

app.get("/tradingview", (req, res) => {
    res.render("tradingview");
});

app.get("/create", (req, res) => {
    res.render("create");
});


app.use('/auth', require('./routes/auth'));


app.listen(3000, () => {
    console.log("server started on port 3000");
});
