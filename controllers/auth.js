const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/uplopad");
const multer = require('multer');

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

exports.createCourse = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ error: err });
    } else {
      const {
        courseTitle,
        courseDescription,
        courseLink,
        courseCategory,
      } = req.body;

      console.log("Uploaded Files:", req.files);

      if (!courseTitle || !courseDescription || !courseLink) {
        return res.status(400).send({
          error: "Course Title, Description, and Link are required",
        });
      }

      const assignmentFile = req.files.assignmentFile
        ? req.files.assignmentFile[0].filename
        : null;

      const newCourse = {
        title: courseTitle,
        desc: courseDescription,
        links: courseLink,
        catagory: courseCategory,
        assignments: assignmentFile,
      };

      console.log("Course Data:", newCourse);

      const query = `
          INSERT INTO course (title, description, links, catagory, assignments) 
          VALUES (?, ?, ?, ?, ?)
        `;

      db.query(
        query,
        [
          newCourse.title,
          newCourse.desc,
          newCourse.links,
          newCourse.catagory,
          newCourse.assignments,
        ],
        (error, results) => {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .send({ error: "Error saving course to the database" });
          }

          res.redirect("/course");
        }
      );
    }
  });
};

exports.getAllCourses = (req, res) => {
  const query = 'SELECT * FROM course'; 
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error retrieving courses:', err);
          return res.status(500).json({ error: err.message }); 
      }

      const coursesWithLinks = results.map(course => {
          const pdfLink = course.assignments ? `http://localhost:3000/download-pdf/${course.id}` : null;

          return {
              id: course.id,
              title: course.title,
              description: course.description,
              links: course.links,
              category: course.catagory, 
              pdfLink: pdfLink 
          };
      });

      res.json(coursesWithLinks); 
  });
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/login");
};
