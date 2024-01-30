const { Pool } = require('pg');

const dbConfig = require('./connection.json');
const pool = new Pool(dbConfig);

// ==========================================================
const commons = require('./commons.js');
// const constants = require('./constants.js');
// const dbOps = require('./db_ops.js');
// ==========================================================

async function insertCompanyData(companyName, companyDescription) {
    try {
        const companyInsertQuery = 'INSERT INTO company (company_name, company_description) VALUES ($1, $2) RETURNING company_id;';
        const companyResults = await pool.query(companyInsertQuery, [companyName, companyDescription]);

        console.log('COMPANY ID (insert query): ' + companyResults.rows[0].company_id);
        return companyResults.rows[0].company_id;
    } catch (error) {
        if (error.code === '23505') {
            error.hint = 'Error! Company Name must be unique!';
        }
        throw error;
    }
}

async function insertCompanyDepartment(companyId, departmentId) {
    try {
        const depInsertQuery = 'INSERT INTO company_department (company_id, department_id) VALUES ($1, $2);';
        const depResults = await pool.query(depInsertQuery, [companyId, departmentId]);

        return depResults;
    } catch (error) {
        error.hint = 'Error! Invalid Company/Department Data!';
        throw error;
    }
}

async function insertEmployee(employeeName, email, password, depId, companyId) {
    try {
        const employeeInsertQuery = 'INSERT INTO employee (employee_name, employee_email, employee_password, department_id, company_id) VALUES ($1, $2, $3, $4, $5);';
        const employeeResults = await pool.query(employeeInsertQuery, [employeeName, email, password, depId, companyId]);

        return employeeResults;
    } catch (error) {
        await commons.deleteCompanyById(companyId);
        if (error.code === '23505') {
            error.hint = 'Error! Email must be unique!';
        }
        throw error;
    }
}

module.exports = {
    insertCompanyData,
    insertCompanyDepartment,
    insertEmployee
}
