const { Pool } = require('pg');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'pf',
    password: 'asdf1234',
    port: 5432,
};

const pool = new Pool(dbConfig);

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

module.exports = {
    getAllCompanyData,
    getCompanyDataByName,
    respondErrorMessage
};
