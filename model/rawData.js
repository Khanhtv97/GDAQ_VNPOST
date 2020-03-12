const knex = require('knex')(require('./connection'));

knex.schema
.hasTable('rawdata').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('rawdata', function(t) {
        t.increments('id').primary();
        t.string('barcode');
        t.json('rawU81').nullable; 
        t.json('rawScale').nullable; 
    })}
});
knex.select().table('rawdata').then((data)=>
    {
      data.map(function(row){
        console.log(row)
      })
    }
    )
