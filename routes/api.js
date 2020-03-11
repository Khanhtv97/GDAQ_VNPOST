var express = require('express');
var router = express.Router();
const knex = require('knex')(require('../model/connection'));
var u81Controller = require('../controller/u81Controller');
const SerialPort = require('serialport'); 
var io = require('socket.io')(require('../bin/server'));
var export2excel = require('../services/export2excel');

/* GET home page. */
router.get('/', function(req, res, next) {
  knex.select().table('tbcalibSS').then((data)=>{
    res.render('index', {dataCalib: data});
  });
});
/* GET login page. */
router.get('/login', function(req, res, next){
  res.render('login');

});
router.get('/datalog', function(req, res, next){
    var fromDate = req.query.fromdate;
    var fromTime = req.query.fromtime;
    var toDate = req.query.todate;
    var toTime = req.query.totime;
    var fromDT = fromDate+' '+fromTime;
    var toDT = toDate+' '+toTime;
    if(fromDate != null&&toDate!=null){
    knex.select().table('tbdata').whereBetween('created_at', [fromDT, toDT]).orderBy('id', 'desc').then((data)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
    {
      // data.map(function(row){
          //console.log(data.barocde);
      res.render('datalog', {dataGDAQ: data});
      //})
    })
  }else{
    knex.select().table('tbdata').orderBy('id', 'desc').limit(50).then((data)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
    {
      // data.map(function(row){
          //console.log(data.barocde);
      res.render('datalog', {dataGDAQ: data});
      //})
    })
  }
});
router.get('/export2excel', function(req, res, next){
  knex.select().table('tbdata').orderBy('id', 'desc').then((dataTB)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
  {
    export2excel.exportExcel(dataTB, res);
  });
});
// * GET config Page */
router.get('/config', function(req, res, next){
  var dataCalib = {calibLength: "", calibHeight: "", calibWidth: ""};
  const portSS = new SerialPort('/dev/ttyUSB0', { baudRate: 19200, dataBits: 8, parity: 'none'});
  u81Controller.OneShotReadU81(portSS, u81Controller.constU81.oneshot1,u81Controller.constU81.oneshot2, u81Controller.constU81.oneshot3).then((dataU81)=>{
    if(dataU81.rawData.length ==78){ //make sure no error when calib SS
    dataCalib.calibLength = dataU81.L.Lmm;
    dataCalib.calibHeight = dataU81.H.Hmm;
    dataCalib.calibWidth = dataU81.W.Wmm;
    knex('tbcalibSS').update(dataCalib).then((result)=>{
      console.log("success to CALIB SS ! ");
    });
    u81Controller.onLaserU81(portSS,u81Controller.constU81.onLaserSS1,u81Controller.constU81.onLaserSS2, u81Controller.constU81.onLaserSS3);
    res.redirect('/');
  }else{
    console.log("calib faile");
  }
    
  });
});
module.exports = router;
