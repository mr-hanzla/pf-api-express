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

// /company
router.get('/', async (req, res) => {
    try {
        // res.status(constants.HTTP.OK).send("This is a simple response!");
        // res.status(constants.HTTP.OK).json({ message: "This is a JSON response!"});
        // Get company name from header
        const { companyName } = req.body;

        // If company name is present, search with company name
        const { rows } = companyName ? await dbOps.getCompanyDataByName(companyName)
        : await dbOps.getAllCompanyData();

        // // Send the query result as JSON response
        res.status(201).json(rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(constants.HTTP.BadRequest).json({ error: 'Internal Server Error' });
    }
});

router.post('/add-department', async (req, res) => {
    try {
        const { companyName, departmentName } = req.body;

        const depId = constants.Departments[departmentName];
        const companyId = await dbOps.getCompanyId(companyName);

        console.log(depId === undefined, companyId === -1);

        if (depId === undefined || companyId === -1) {
            return res.status(constants.HTTP.BadRequest).json({ message: `ERROR! Invalid Company Name or Department Name!` });
        }

        const checkQuery = 'SELECT * FROM company_department WHERE company_id = $1 AND department_id = $2';
        const checkResult = await pool.query(checkQuery, [companyId, depId]);

        if (checkResult.rows.length === 0) {
            const insertQuery = 'INSERT INTO company_department (company_id, department_id) VALUES ($1, $2)';
            await pool.query(insertQuery, [companyId, depId]);
            return res.status(201).json({ message: `'${departmentName}' department is added to '${companyName}'.` });
        } else {
            return res.status(constants.HTTP.BadRequest).json({ message: `'${departmentName}' already exists for '${companyName}'.` });
        }
    } catch (error) {
        error.hint = 'Company Name or Department Name is Invalid!';
        commons.respondErrorMessage(res, error);
    }
});

router.delete('/remove', async (req, res) => {
    try {
        const { companyName } = req.body;

        const companyId = await dbOps.getCompanyId(companyName);
        const queryResults = companyId > 0 ? await dbOps.deleteCompanyById(companyId) : null;

        if (queryResults) {
            if (queryResults.rowCount > 0)
                res.status(constants.HTTP.OK).json({message: `'${companyName}' is deleted!`});
        }
        res.status(constants.HTTP.NotFound).json({message: `'${companyName}' is not found!`});
    } catch (error) {
        error.hint = 'Error: Invalid request!';
        commons.respondErrorMessage(res, error);
    }
});

router.put('/update', async (req, res) => {
    try {
        const { companyName, updatedCompanyName } = req.body;

        const companyId = await dbOps.getCompanyId(companyName);
        const companyResults = await dbOps.updateCompanyData(companyId, updatedCompanyName);

        res.status(constants.HTTP.OK).json({message: `'${companyName}' is updated!`});

    } catch (error) {
        error.hint = 'Error: Invalid Request!';
        commons.respondErrorMessage(res, error);
    }
});

router.post('/register', async (req, res) => {
    let companyId;

    try {
        const { companyName, companyDescription, employeeName, email, password } = req.body;
        console.log({companyName, companyDescription, employeeName, email, password});

        // step-1: register company data
        companyId = await dbOps.insertCompanyData(companyName, companyDescription);

        // step-2: once company is registered, add a department to it
        const depResults = await dbOps.insertCompanyDepartment(companyId, constants.Departments.Admin);

        // step-3: lastly, add employee data to db
        const employeeResults = await dbOps.insertEmployee(employeeName, email, password, constants.Departments.Admin, companyId);

        res.status(201).json({ message: `'${companyName}' is registered!` });
    } catch (error) {
        console.log(`COMPANY-ID: ${companyId}`);
        if (companyId) {
            await dbOps.deleteCompanyById(companyId);
        }
        commons.respondErrorMessage(res, error);
    }
});

module.exports = router;
