const knex = require('knex')(require('./connection'));

knex.schema
.hasTable('devices').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('devices', function(t) {
        t.increments('id').primary();
        t.string('name').nullable;
        t.string('devicecode').nullable;
        t.string('port').nullable;
        t.string('baurate').nullable; // var dataGDAQ = {barocde: "", massweigh:"", calweigh, priceweigh, diffweigh, rate, length,width, height, massweighVNP, calweighVNP, priceweighVNP, lengthVNP, widthVNP, heightVNP}
        t.string('databits').nullable;
        t.string('stopbits').nullable;
        t.string('parity').nullable;
        t.string('serialnumber').nullable;
        t.string('mac').nullable;
    });
    }
  })
    .catch(function(e) {
      console.error(e);
    });
//      .then(function(){
//   return knex('tbdata').insert({ name: "Cam Bien Do K/C", massweigh: '12345', calweigh: "380", priceweigh: '380'})

 //})