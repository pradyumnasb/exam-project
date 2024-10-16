const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require('../middleware/uplopad');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.register = (req, res) => {
  console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length > 0) {
        return res.render("register", {
          message: "That email is already in use",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Passwords do not match",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);

      db.query(
        "INSERT INTO users SET ?",
        { name: name, email: email, password: hashedPassword },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            return res.render("register", {
              message: "User registered",
            });
          }
        }
      );
    }
  );
};

exports.login = (req, res) => {
  const { name, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE name = ?",
    [name],
    async (error, results) => {
      if (error) {
        console.log(error);
        return res.render("login", {
          message: "An error occurred. Please try again.",
        });
      }

      if (results.length === 0) {
        return res.render("login", {
          message: "User not registered",
        });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.cookie("jwt", token, { httpOnly: true });

        return res.redirect("/");
      } else {
        return res.render("login", {
          message: "Password is incorrect",
        });
      }
    }
  );
};

// Handle POST request for creating a new course
exports.createCourse = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).send({ error: err });
      } else {
        const {
          courseTitle,
          courseDescription,
          courseLink,  // This will be the website link
          courseCategory,
        //   assignmentTitle,
        } = req.body;
  console.log("sdfghj", req.body);
        // Validate required fields
        if (!courseTitle || !courseDescription || !courseLink) {
          return res
            .status(400)
            .send({ error: "Course Title, Description, and Link are required" });
        }
  
        // Files will be available in req.files
        const assignmentFile = req.files.assignmentFile
          ? req.files.assignmentFile[0].filename
          : null;
  
        // Prepare data for insertion
        const newCourse = {
          title: courseTitle,
          desc: courseDescription,
          links: courseLink,  // Website link directly
          catagory: courseCategory,
          assignments: assignmentFile, // Assignment file or null if not provided
        };
        console.log("asdfgsasaf", newCourse);
        // Insert into the 'course' table
        const query = `
          INSERT INTO course (title, description, links, catagory, assignments) 
          VALUES (?, ?, ?, ?, ?)
        `;
  
        db.query(
          query,
          [newCourse.title, newCourse.desc, newCourse.links, newCourse.catagory, newCourse.assignments],
          (error, results) => {
            if (error) {
              console.error(error);
              return res
                .status(500)
                .send({ error: "Error saving course to the database" });
            }
  
            res.status(200).send({
              message: "Course created successfully",
              data: newCourse,
            });
          }
        );
      }
    });
  };

exports.logout = (req, res) => {
  // Clear the cookie
  res.clearCookie("jwt");
  return res.redirect("/login");
};
