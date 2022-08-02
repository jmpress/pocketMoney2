const { Pool } = require('pg');
require('dotenv').config();

const connectionString = 'postgres://nrzepyzgnlthqb:a92b8ef5c8c24bb819383751f8ec0150fe9d44ceb92254e4fe6124c060a9d25c@ec2-54-208-104-27.compute-1.amazonaws.com:5432/dijm0q1volemf'

const pool = new Pool({
    connectionString: connectionString,
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