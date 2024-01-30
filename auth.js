var express = require('express');
const { Pool } = require('pg');
var router = express.Router();

const dbConfig = require('./connection.json');
const pool = new Pool(dbConfig);

// ==========================================================
const commons = require('./commons.js');
const constants = require('./constants.js');
const dbOps = require('./db_ops.js');
// ==========================================================

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const loginQuery = 'SELECT * FROM employee WHERE employee_email = $1 AND employee_password = $2;';
    pool.query(loginQuery, [email, password], (err, result) => {
        if (err) {
            err.hint = `There is no user with the email: "${email}"`;
            respondErrorMessage(res, err);
        } else {
            console.log(result.rows);
            if (result.rows.length > 0) {
                res.status(constants.HTTP.Created).json({ message: `${result.rows[0].employee_name.toUpperCase()} is logged in!` });
            } else {
                res.status(constants.HTTP.BadRequest).json({ message: 'email or password is incorrect!' });
            }
        }
    });
});

router.post('/signup', async (req, res) => {
    const { employeeName, email, password, departmentName, companyName } = req.body;

    const depId = constants.Departments[departmentName];
    let companyId = await dbOps.getCompanyId(companyName);

    if (depId === undefined || companyId === -1) {
        return res.status(constants.HTTP.BadRequest).json({ message: `ERROR! Invalid Company Name or Department Name!` });
    }

    const signupQuery = `
    INSERT INTO employee (employee_name, employee_email, employee_password, department_id, company_id)
    VALUES ($1, $2, $3, $4, $5);
    `;
    pool.query(signupQuery, [employeeName, email, password, depId, companyId], (err, results) => {
        if (err) {
            console.log(err);
            res.status(constants.HTTP.BadRequest).json({ message: 'Sign Up Failed!' });
        } else {
            res.status(constants.HTTP.Created).json({ message: `${employeeName} is Signed Up!` });
        }
    });
});

module.exports = router;
