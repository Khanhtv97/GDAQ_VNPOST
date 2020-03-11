const knex = require('knex')(require('./connection'));

knex.schema
.hasTable('tbdata').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('tbdata', function(t) {
        t.increments('id').primary();
        t.string('barcode').nullable;
        t.string('massweight').nullable; // var dataGDAQ = {barocde: "", massweigh:"", calweigh, priceweigh, diffweigh, rate, length,width, height, massweighVNP, calweighVNP, priceweighVNP, lengthVNP, widthVNP, heightVNP}
        t.string('calweight').nullable;
        t.string('priceweight', 100).nullable;
        t.string('diffweight', 100).nullable;
        t.string('rate', 100).nullable;
        t.string('length', 100).nullable;
        t.string('width', 100).nullable;
        t.string('height', 100).nullable;
        t.string('massweightVNP', 100).nullable;
        t.string('calweightVNP', 100).nullable;
        t.string('priceweightVNP', 100).nullable;
        t.string('lengthVNP', 100).nullable;
        t.string('widthVNP', 100).nullable;
        t.string('heightVNP', 100).nullable;
        t.string('pathPicture', 100).nullable;
        // t.json('rawU81').nullable;
        // t.json('rawScale').nullable;
        t.timestamps(false, true);
      });
    }
  })
    .catch(function(e) {
      console.error(e);
    });
//  .then(function(){
//   return knex('tbdata').insert({ barocde: 123456, massweigh: '12345', calweigh: "380", priceweigh: '380'})

//  })
  // Finally, add a .catch handler for the promise chain
  
    knex.select().table('tbdata').then((data)=>
    {
      data.map(function(row){
        console.log(row)
      })
    }
    )
  
    
  
  // .map(function(row) {
  //     console.log(row);
  //   })
  module.exports= {
    gdaqData(){
      //(knex.select().table('tbdata')).map(function(row){
        return new Promise((resolve, reject)=> {
          (knex.select().table('tbdata')).map(function(row){
            resolve(row);
        })
      })
    }
  }