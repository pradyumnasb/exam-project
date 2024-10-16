const mysql = require("mysql");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);
    const { name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length > 0) {
            return res.render('register', {
                message: 'That email is already in use'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?',
            { name: name, email: email, password: hashedPassword },
            (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    return res.render('register', {
                        message: 'User registered'
                    });
                }
            });
    });
}

exports.login = (req, res) => {
    const { name, password } = req.body;


    db.query('SELECT * FROM users WHERE name = ?', [name], async (error, results) => {
        if (error) {
            console.log(error);
            return res.render('login', { message: 'An error occurred. Please try again.' });
        }

        if (results.length === 0) {
            return res.render('login', {
                message: 'User not registered'
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });


            res.cookie('jwt', token, { httpOnly: true });

            return res.redirect('/');
        } else {
            return res.render('login', {
                message: 'Password is incorrect'
            });
        }
    });
}



exports.logout = (req, res) => {
    // Clear the cookie
    res.clearCookie('jwt');
    return res.redirect('/login');
}
