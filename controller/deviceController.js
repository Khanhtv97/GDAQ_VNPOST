const knex = require('knex')(require('../model/connection'));
var u81Controller = require('../controller/u81Controller');
const SerialPort = require('serialport'); 

function addDevice(req, res, next){
    knex('devices').insert({
      name: req.body.name,
      devicecode: req.body.devicecode,
      port: req.body.port,
      baurate: req.body.baurate,
      databits: req.body.databits,
      stopbits: req.body.stopbits,
      parity: req.body.parity
      }).then((data)=>{
        res.redirect('/configdevice');
    })
    .catch(err => next(err));
}
function deleteDevice(req, res, next){
    knex('devices').where('id',req.body.id).del().then((result)=>{
        res.redirect('/configdevice');
    })
    .catch(err => next(err));
}

async function updateDevice(req, res, next){
    knex('devices').where('id', req.body.id).update({
        name: req.body.name,
        devicecode: req.body.devicecode,
        port: req.body.port,
        baurate: req.body.baurate,
        databits: req.body.databits,
        stopbits: req.body.stopbits,
        parity: req.body.parity}).then((err)=>{
        res.redirect('/configdevice');
      })
      .catch(err => next(err));
      //res.redirect('/configdevice');
  }
  function calibSS(req, res, next){
    var dataCalib = {calibLength: "", calibHeight: "", calibWidth: ""};
    u81Controller.portU81().then((dataPU81)=>{
      const portSS = new SerialPort(dataPU81.port, { baudRate: dataPU81.baurate, dataBits: dataPU81.databits, parity: dataPU81.parity});
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
          console.log("calib fail");
        }
    });
  });
  }
function setAddressSS(req,res){
  if (req.body.nameSS = 'ssDai'){
    u81Controller.portU81().then((dataPU81)=>{
      const portSS = new SerialPort(dataPU81.port, { baudRate: dataPU81.baurate, dataBits: dataPU81.databits, parity: dataPU81.parity});
      u81Controller.setAddress(portSS, u81Controller.constU81.setAddressSS1).then((data)=>{
        if(data == 'aa0000100001000112'){res.send("Cài đặt địa chỉ thành công !")}
        else{res.send("Cài đặt địa chỉ không thành công")}
      });
    })
  }
  else if (req.body.nameSS = 'ssRong'){
    u81Controller.portU81().then((dataPU81)=>{
      const portSS = new SerialPort(dataPU81.port, { baudRate: dataPU81.baurate, dataBits: dataPU81.databits, parity: dataPU81.parity});
      u81Controller.setAddress(portSS, u81Controller.constU81.setAddressSS3).then((data)=>{
        if(data == 'aa0000100001000314'){res.send("Cài đặt địa chỉ thành công !")}
        else{res.send("Cài đặt địa chỉ không thành công")}
      });
    })
  }
  else if (req.body.nameSS = 'ssCao'){
    u81Controller.portU81().then((dataPU81)=>{
      const portSS = new SerialPort(dataPU81.port, { baudRate: dataPU81.baurate, dataBits: dataPU81.databits, parity: dataPU81.parity});
      u81Controller.setAddress(portSS, u81Controller.constU81.setAddressSS2).then((data)=>{
        if(data == 'aa0000100001000213'){res.send("Cài đặt địa chỉ thành công !")}
        else{res.send("Cài đặt địa chỉ không thành công")}
      });
    })
  }
}

module.exports.Controller = {addDevice, deleteDevice, updateDevice, calibSS, setAddressSS};