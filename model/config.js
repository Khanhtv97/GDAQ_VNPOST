const knex = require('knex')(require('./connection'));

knex.schema
.hasTable('sendConfig').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('sendConfig', function(t) {
        t.increments('id').primary();
        t.boolean('type').nullable;
    });
    }
  }).catch(function(e) {
      console.error(e);
})
knex.select().table('sendConfig').then((data)=>
    {
      data.map(function(row){
        console.log(row.type)
      })

    }
    )