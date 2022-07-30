const { Pool } = require('pg');

const pool = new Pool({
    user: 'apiuser',
    host: 'localhost',
    database: 'pocket_money_2',
    password: '020681',
    port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}