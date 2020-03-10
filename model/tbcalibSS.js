const knex = require('knex')(require('../model/connection'));

knex.schema
.hasTable('tbcalibSS').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('tbcalibSS', function(t) {
        t.increments('id').primary();
        t.string('calibLength').nullable;
        t.string('calibWidth').nullable;
        t.string('calibHeight').nullable; // var dataGDAQ = {barocde: "", massweigh:"", calweigh, priceweigh, diffweigh, rate, length,width, height, massweighVNP, calweighVNP, priceweighVNP, lengthVNP, widthVNP, heightVNP}
      });
    }
  })
    .catch(function(e) {
      console.error(e);
    });
    knex('tbcalibSS').insert({calibLength: '520', calibWidth: '409',calibHeight: '541'}).then((result)=>{
      console.log("success insert to DB ! ");
  });
  // knex.select().table('tbcalibSS').then((data)=>
  //   {
  //     data.map(function(row){
  //       console.log(row)
  //     })
  //   }
  //   )