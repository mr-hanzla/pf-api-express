var express = require('express');
const { Pool } = require('pg');
var router = express.Router();

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'pf',
    password: 'asdf1234',
    port: 5432,
};

const pool = new Pool(dbConfig);

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const companyInsertQuery = 'SELECT * FROM employee WHERE employee_email = $1 AND employee_password = $2;';
    pool.query(companyInsertQuery, [email, password], (err, result) => {
        if (err) {
            respondErrorMessage(res, err);
        } else {
            console.log(result.rows);
            if (result.rows.length > 0) {
                res.status(201).json({ message: `${result.rows[0].employee_name.toUpperCase()} is logged in!` });
            } else {
                res.status(404).json({ message: `'${email}' or password must be incorrect!` });
            }
        }
    });
});


module.exports = router;
