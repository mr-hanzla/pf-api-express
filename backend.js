const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// const { username, password, database, host, dialect } = require('./config.json');
// console.log({ username, password, database, host, dialect });
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'pf',
    password: 'asdf1234',
    port: 5432,
};

const pool = new Pool(dbConfig);

// ==========================================================
//                      CONSTANTS
// ==========================================================
const Departments = Object.freeze({
    Admin: 1,
    Marketing: 2,
    Sales: 3,
    Production: 4,
    Legal: 5
});

// ==========================================================
//                      HELPING FUNCTIONS
// ==========================================================
async function getCompanyIdName(companyName) {
    const companyDataQuery = 'SELECT company_id, company_name FROM company WHERE company_name = $1;';
    const { rows } = await pool.query(companyDataQuery, [companyName]);
    return rows.length > 0 ? rows[0] : null;
}

async function getDepartmentData(depName) {
    const depQuery = 'SELECT * FROM department WHERE department_name = $1;';
    const { rows } = await pool.query(depQuery, [depName]);
    return rows.length > 0 ? rows[0] : null;
}

function respondErrorMessage(res, error) {
    console.error('Error adding data to the database:', error);
    res.status(500).json({ err: 'Internal Server Error ' + error });
    console.log(error);
}

// ==========================================================
//                      ROUTES
// ==========================================================

const company = require('./company.js');
app.use('/company', company);

const department = require('./department.js');
app.use('/department', department)

const auth = require('./auth.js');
app.use('/auth', auth);

// Start the Express server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});
