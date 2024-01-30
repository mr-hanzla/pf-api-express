const { Pool } = require('pg');

const dbConfig = require('./connection.json');
const pool = new Pool(dbConfig);

function respondErrorMessage(res, error) {
    console.error('Error adding data to the database:', error);
    res.status(500).json({ err: 'Internal Server Error: ' + error.hint ? error.hint : error });
}

module.exports = {
    respondErrorMessage,
};
