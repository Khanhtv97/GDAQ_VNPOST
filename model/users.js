const knex = require('knex')(require('./connection'));

knex.schema
.hasTable('tbdata').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('tbdata', function(t) {
        t.increments('id').primary();
        t.string('name');
        t.string('username'); 
        t.string('password'); 
        t.integer('role');
    })}
});
