var express = require('express');
var router = express.Router();
const knex = require('knex')(require('../model/connection'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
/* GET login page. */
router.get('/login', function(req, res, next){
  res.render('login');

});
router.get('/datalog', function(req, res, next){
    knex.select().table('tbdata').orderBy('id', 'desc').then((data)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
    {
      // data.map(function(row){
          //console.log(data.barocde);
      res.render('datalog', {dataGDAQ: data});
      //})
    })
})
module.exports = router;
