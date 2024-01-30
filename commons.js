const { Pool } = require('pg');

const dbConfig = require('./connection.json');
const pool = new Pool(dbConfig);

async function getCompanyId(companyName) {
    const allCompanyQuery = 'SELECT company_id FROM company WHERE company_name = $1;';
    try {
        const results = await pool.query(allCompanyQuery, [companyName]);
        if (results.rows.length > 0) {
            return results.rows[0].company_id;
        } else {
            // Company not found
            return -1;
        }
    } catch (error) {
        throw error;
    }
}

function getAllCompanyData() {
    const allCompanyQuery = 'SELECT * FROM company;';
    return pool.query(allCompanyQuery);
}

function getCompanyDataByName(name) {
    const allCompanyQuery = 'SELECT * FROM company WHERE company_name = $1;';
    return pool.query(allCompanyQuery, [name]); 
}

async function deleteCompanyById(companyId) {
    const deleteCompanyQuery = 'DELETE FROM company WHERE company_id = $1;';
    return await pool.query(deleteCompanyQuery, [companyId]); 
}

function respondErrorMessage(res, error) {
    console.error('Error adding data to the database:', error);
    res.status(500).json({ err: 'Internal Server Error: ' + error.hint ? error.hint : error });
}

module.exports = {
    getAllCompanyData,
    getCompanyDataByName,
    respondErrorMessage,
    deleteCompanyById,
    getCompanyId
};
