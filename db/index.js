const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://localhost/users_express_db'
});

client.connect();

module.exports = client;
