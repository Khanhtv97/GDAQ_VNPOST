const knex = require('knex')({
    client: 'sqlite3',
    timezone: 'UTC',
    connection: {
      filename: '../database/GDAQ.sqlite',
    },
    useNullAsDefault: true
  });

    module.exports.knex=knex;
    module.exports = {
        client: 'sqlite3',
        timezone: 'UTC+7',
    connection: {
      filename: '../database/GDAQ.sqlite',
    },
    useNullAsDefault: true
    }