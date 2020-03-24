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
var UserController = require('../controller/userController');
var DataController = require('../controller/dataController');
var DeviceController = require('../controller/deviceController');
//**For authen */
const bcrypt = require('bcrypt');
const passport = require('passport')
const initializePassport = require('../passport-config')
initializePassport(
  passport,
  username => listUsers.find(user => user.username === username),
  id => listUsers.find(user => user.id === id))

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
    knex.select().table('tbdata').orderBy('id', 'desc').limit(200).then((data)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
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
// data controller
router.get('/submitRecords', function(req, res){
  knex.select().table('tbdata').orderBy('id', 'desc').where({'check': true, 'isSent': false}).then((data)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
    {
      res.render('dataSubmit', {dataGDAQ: data, messages: ""});
    })
});
router.post('/submitRecords', function(req, res){
  DataController.controller.submitdataByID(req, res);

});

router.post('/deleteRecords', function(req, res){
  DataController.controller.deleteRecords(req, res);
})
router.post('/tranferDatatype', function(req, res){
  DataController.controller.tranferDataType(req, res);
});
// export excel
router.get('/export2excel', function(req, res, next){
  knex.select().table('tbdata').orderBy('id', 'desc').then((dataTB)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
  {
    export2excel.exportExcel(dataTB, res);
  });
});
////////////////
// * GET config Page */
router.get('/calibSS',checkAuthenticated, function(req, res, next){
  DeviceController.Controller.calibSS(req, res, next);
});
router.get('/users', checkAuthenticated, (req, res) => {
  if(req.user.role ==1){
  knex.select().table('users').then((data)=> 
  {
    res.render('usersManage.ejs', {users: data});
  });
}else{
  res.redirect('/setting');
}
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
router.post('/register', function(req, res){
  UserController.Controller.register(req, res);
});
router.post('/updateUser', function(req, res){
  UserController.Controller.update(req, res);
});
router.post('/deleteUser', function(req, res, next){
  UserController.Controller.deleteUser(req, res, next);
});
router.delete('/logout', (req, res) => {
  req.logOut()
  res.render('login')
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
router.post('/changepassword',checkAuthenticated, async(req, res, next)=>{
  UserController.Controller.changepassword(req, res);
  //listUsers.push([]);
});

/**END USERS */
/*SETTING*/
router.get('/setting', checkAuthenticated, (req, res) => {
 
  knex.select().table('sendConfig').then((data)=>{
    res.render('setting', {iduser: req.user.id, sendDataType: data});
  })
  // knex.table('users').select().then((data)=>{
  //   data.map(function(row){
  //     listUsers.push(row);
  //   });
  // });
});
router.get('/manufacturesetting', checkAuthenticated, (req, res) => {
  res.render('settingManufacture');
});
router.get('/configdevice', checkAuthenticated, (req, res) => {
  if(req.user.role ==1){
  knex.select().table('devices').then((data)=> 
  {
      res.render('config.ejs', {devices: data});
  });
}else{
  res.redirect('/setting')
}
});
router.post('/adddevices', function(req, res, next){
  //DeviceController.Controller.adddevice(req, res, next);
  DeviceController.Controller.addDevice(req, res, next);
});
router.post('/deleteDevice', function(req, res, next){
  DeviceController.Controller.deleteDevice(req, res, next);
});
router.post('/updatedevice', function(req, res, next){
  DeviceController.Controller.updateDevice(req, res, next);
});
router.post('/loginadmin', passport.authenticate('local', {
  successRedirect: '/users',
  failureRedirect: '/setting',
  failureFlash: true
}))
// loginmanufacture
router.post('/loginmanufacture', passport.authenticate('local', {
  successRedirect: '/configdevice',
  failureRedirect: '/setting',
  failureFlash: true
}))

router.post('/setaddress', function(req, res){
  DeviceController.Controller.setAddressSS(req, res);
});
/*END SETTING*/

/** Shut down and reboot */
var exec = require('child_process').exec;

router.get('/shutdown', function(req, res){
  shutdown(function(output){
    console.log(output);
});
})
router.get('/reboot', function(req, res){
  reboot(function(output){
    console.log(output);
});
});
// Create shutdown function
function shutdown(callback){
    exec('shutdown now', function(error, stdout, stderr){ callback(stdout); });
}
function reboot(callback){
  exec('shutdown -r now', function(error, stdout, stderr){ callback(stdout); });
}
/**END */
module.exports = router;
