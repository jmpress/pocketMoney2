const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    /*
    user: process.env.PMAPIUSER,
    host: process.env.PMHOST,
    database: process.env.PMDATABASE,
    password: process.env.PMAPIUSERPW,
    port: process.env.PMDBPORT,
    */
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}