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

const Departments = Object.freeze({
    Admin: 1,
    Marketing: 2,
    Sales: 3,
    Production: 4,
    Legal: 5
});

// ==========================================================
function getAllCompanyData() {
    const allCompanyQuery = 'SELECT * FROM company;';
    return pool.query(allCompanyQuery); 
}

function getCompanyDataByName(name) {
    const allCompanyQuery = 'SELECT * FROM company WHERE company_name = $1;';
    return pool.query(allCompanyQuery, [name]); 
}

function respondErrorMessage(res, error) {
    console.error('Error adding data to the database:', error);
    res.status(500).json({ err: 'Internal Server Error ' + error });
    console.log(error);
}
// ==========================================================

router.get('/', async (req, res) => {
    try {
        // Get company name from header
        const { company_name } = req.body;

        // If company name is present, search with company name
        const { rows } = company_name ? await getCompanyDataByName(company_name)
        : await getAllCompanyData();

        // Send the query result as JSON response
        res.status(201).json(rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/register', async (req, res) => {
    // Extract data from the form
    const { company_name, company_description, employee_name, email, password } = req.body;
    console.log({company_name, company_description, employee_name, email, password});

    // step-1: register company data
    const companyInsertQuery = 'INSERT INTO company (company_name, company_description) VALUES ($1, $2) RETURNING company_id;';
    pool.query(companyInsertQuery, [company_name, company_description], (err, result) => {
        if (err) {
            respondErrorMessage(res, err);
        } else {
            const companyId = result.rows[0].company_id;
            // step-2: once company is registered, add a department to it
            const depInsertQuery = 'INSERT INTO company_department (company_id, department_id) VALUES ($1, $2);';
            pool.query(depInsertQuery, [companyId, Departments.Admin], (depError, depResults) => {
                if (depError) {
                    respondErrorMessage(res, depError);
                } else {
                    // step-3: once company is registered with a department, add a employee
                    const employeeInsertQuery = 'INSERT INTO employee (employee_name, employee_email, employee_password, department_id, company_id) VALUES ($1, $2, $3, $4, $5);';
                    pool.query(employeeInsertQuery, [employee_name, email, password, Departments.Admin, companyId], (empError, empResults) => {
                        if (empError) {
                            respondErrorMessage(res, empError);
                        } else {
                            // Send a success response
                            res.status(201).json({ message: `'${company_name}' is registered!` });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
