if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
var express = require('express');
var router = express.Router();
const knex = require('knex')(require('../model/connection'));
var u81Controller = require('../controller/u81Controller');
const SerialPort = require('serialport'); 
var io = require('socket.io')(require('../bin/server'));
var export2excel = require('../services/export2excel');
//**For authen */
const bcrypt = require('bcrypt');
const passport = require('passport')
const initializePassport = require('../passport-config')
initializePassport(
  passport,
  username => listUsers.find(user => user.username === username),
  id => listUsers.find(user => user.id === id))
const users = []
const listUsers = [] //get list user available

//////////////////////////////////////////////////////////////////////

/* GET home page. */
router.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { user: req.user.name })
});

router.get('/datalog', function(req, res){
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
router.get('/rawData', function(req, res){
  knex.select().table('rawdata').orderBy('id', 'desc').then((data)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
  {
  res.render('raw', {raw: data});
  });

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

/*Login and register */
/* GET login page. */
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
  knex.table('users').select().then((data)=>{
    data.map(function(row){
      listUsers.push(row);
    });
  });
})
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
router.get('/register', function(req, res, next){
  res.render('register');
});

router.post('/register', async(req, res)=>{
  try{
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      username: req.body.username,
      password: hashPassword
    });
    res.redirect('/login');


  }catch{
    res.redirect('register');

  }
  knex('users').insert(users).then((data)=>{
    console.log("success to create Users")
  })
});
router.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
module.exports = router;
