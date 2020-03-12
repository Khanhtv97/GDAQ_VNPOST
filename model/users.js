const knex = require('knex')(require('./connection'));

knex.schema
.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', function(t) {
        t.integer('id').primary();
        t.string('name');
        t.string('username'); 
        t.string('password'); 
        t.integer('role');
    })}
});
