const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth'); 
const axios = require('axios');
const fs = require('fs');
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

app.get("/course", async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/auth/courses'); 
        console.log("cvm",response);// Replace with your API endpoint
        const data = response.data; // Assuming the API returns JSON data
        res.render("course", { courses: data }); // Pass the data to the course view
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching course data");
    }
});

app.get("/tradingview", (req, res) => {
    res.render("tradingview");
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.get('/download-pdf/:id', (req, res) => {
    const courseId = req.params.id;

    const query = 'SELECT assignments FROM course WHERE id = ?';

    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Error retrieving course:', err);
            return res.status(500).json({ error: err.message });
        }

        if (!results || results.length === 0) {
            return res.status(404).send('Course not found.');
        }

        let assignments = results[0].assignments;

        if (!assignments) {
            return res.status(404).send('No PDF data found for this course.');
        }

        // Check if the data is base64 encoded and decode if necessary
        if (typeof assignments === 'string') {
            assignments = Buffer.from(assignments, 'base64');
        }

        const pdfData = Buffer.from(assignments, 'binary');

        // Save the PDF data to a file to check if it's valid
        const filePath = path.join(__dirname, `course-${courseId}.pdf`);
        fs.writeFile(filePath, pdfData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing PDF file.');
            }

            console.log(`PDF saved to ${filePath}`);
        });

        // Set response headers for downloading the PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=course-${courseId}.pdf`,
            'Content-Length': pdfData.length
        });

        // Send the PDF data as a response
        res.send(pdfData);
    });
});





app.use('/auth', require('./routes/auth'));


app.listen(3000, () => {
    console.log("server started on port 3000");
});
