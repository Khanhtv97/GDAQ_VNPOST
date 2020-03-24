var app = require('../app');
var debug = require('debug')('angular2-nodejs:server');
var http = require('http');
const host = 'http://192.168.0.231:3000'
/* Processing */
var u81Controller = require('../controller/u81Controller');
var scaleController = require('../controller/scaleController');
var barcodeController = require('../controller/barcodeController');
var cameraController = require('../controller/cameraController');
var calCulate = require('../services/Calculate');
var serviceVNP = require('../services/ServiceVnpost');
const token = '26d9acda5b31ebc7fdf6095a0808b7c0';
var io = require('socket.io');
const knex = require('knex')(require('../model/connection'));
const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;

var dataGDAQ = {user: "", barcode: "", massweight:"", calweight: "", priceweight: "", diffweight: "", rate: "", length: "",width: "", height: "", massweightVNP: "", calweightVNP: "", priceweightVNP: "", lengthVNP: "", widthVNP: "", heightVNP: "",poscode:"", check:"", isSent: false, isWrong: "", pathPicture: "", created_at: ""}
var rawData = {barcode: "", rawScale:"", rawU81: ""}
var dataSubmit = {Items: [{ItemCode: "", POSCode: "", Weight: "", Length: "", Width: "", Height: "", WeightConvert: "", isWrong: ""}], Token: "ed4ee293-cf53-425a-bf07-2df9d4fe8ba1"}
let massWeight ='';
let CalWeight = '';
let priceWeight ='';
let massWeightVNP ='-';
let CalWeightVNP = '-';
let priceWeightVNP ='-';
let lengthVNP = '-';
let heightVNP = '-';
let widthVNP = '-';
let serviceCode = '-'
let isAirmail = '';
let check1 = '';
let check2 = ''; 
let sendType = '';
let diffWeight = '';
let rate = '';
let lengthCalib = '';
let widthCalib = '';
let heightCalib = '';
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('socket.io').listen(server);

io.on('connection',(socket)=>{
    console.log('new connection made.');
    knex.select().table('tbcalibSS').then((data)=>
    {
      data.map(function(row){
      lengthCalib = row.calibLength;
      widthCalib = row.calibWidth;
      heightCalib = row.calibHeight;
      io.sockets.emit('calibVal', {Val:"(D:"+lengthCalib+"mm "+"R: "+widthCalib+"mm "+"C: "+heightCalib+"mm)"});
    });
    });
    socket.on('user', function(data){
      dataGDAQ.user = data.us;
    })
});
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
///////////////get data Calib sensors from DB/////////////////////////


/////////////////////////////////////////////////////////////
/* */
try{
  barcodeController.portBarcode().then((data)=>{
      const portBarcode = new SerialPort(data.port, { baudRate: data.baurate, stopBits: data.stopbits,dataBits: data.databits, parity: data.parity, autoOpen: true});//, parsers: new Readline("\r\n")  
      portBarcode.on('data', function(dataBarcode){
          console.log(dataBarcode.toString());
          var takePictureCam = new cameraController.takePicture();
          dataSubmit.Items[0].ItemCode=rawData.barcode = dataGDAQ.barcode = dataBarcode.toString();
          io.sockets.emit('barcode', {barcode: dataBarcode.toString()});
          serviceVNP.vnpService.getSrvVnp(token, dataBarcode.toString()).then((svrRes)=>{
              dataVNP = JSON.parse(svrRes);
              console.log(dataVNP);
              if(dataVNP.Weight != null){massWeightVNP = dataVNP.Weight; dataGDAQ.massweightVNP=dataVNP.Weight;}
              else{massWeightVNP = '-'; dataGDAQ.massweightVNP ='';}
              if(dataVNP.WeightConvert != null){CalWeightVNP = dataVNP.WeightConvert; dataGDAQ.CalWeightVNP = dataVNP.WeightConvert;}
              else{CalWeightVNP = '-'; dataGDAQ.CalWeightVNP = '';}
              if(dataVNP.Width != null){widthVNP = dataVNP.Width; dataGDAQ.widthVNP = dataVNP.Width;}
              else{widthVNP = '-'; dataGDAQ.widthVNP = '';}
              if(dataVNP.Height !=null){heightVNP = dataVNP.Height; dataGDAQ.heightVNP = dataVNP.Height; }
              else{heightVNP = '-'; dataGDAQ.heightVNP = '';}
              if(dataVNP.Length !=null){lengthVNP = dataVNP.Length; dataGDAQ.lengthVNP = dataVNP.Length;}
              else{lengthVNP ='-'; dataGDAQ.lengthVNP = '';}
              isAirmail = dataVNP.IsAirmail;
              dataSubmit.Items[0].POSCode =dataGDAQ.poscode = dataVNP.AcceptancePOSCode; //= dataSubmit.Items[0].POSCode 
              serviceCode = dataVNP.ServiceCode;
              if(massWeightVNP>CalWeightVNP){priceWeightVNP = massWeightVNP;}
              else{priceWeightVNP=CalWeightVNP;}
            });
          try{
          scaleController.portScale().then((dataPScale)=>{
              const portScale = new SerialPort(dataPScale.port, { baudRate:dataPScale.baurate, dataBits: dataPScale.databits, parity: dataPScale.parity, parsers: new Readline("\r\n")});
              scaleController.getdataScale(portScale).then((dataScale)=>{
                  console.log(dataScale);
                  massWeight = dataScale.weigh*1000;
                  dataSubmit.Items[0].Weight = dataGDAQ.massweight = massWeight;
                  check1 = dataScale.check;
                  rawData.rawScale = JSON.stringify(dataScale);
                  io.sockets.emit('weight', {massweight: massWeight, h1: dataScale.header1, msg: dataScale.message});
                });
          });
        }catch{}
          // * Get value Calib*//
          knex.select().table('tbcalibSS').then((data)=>
          {
              data.map(function(row){
              lengthCalib = row.calibLength;
               widthCalib = row.calibWidth;
              heightCalib = row.calibHeight;
              });
          });
          u81Controller.portU81().then((dataPU81)=>{
              const portSS = new SerialPort(dataPU81.port, { baudRate: dataPU81.baurate, dataBits: dataPU81.databits, parity: dataPU81.parity});
              u81Controller.OneShotReadU81(portSS, u81Controller.constU81.oneshot1,u81Controller.constU81.oneshot2, u81Controller.constU81.oneshot3).then((dataU81)=>{
                  console.log(dataU81);
                  rawData.rawU81 = JSON.stringify(dataU81);
                  var lengthPercel ='-';
                  var heightPercel = '-';
                  var widthPercel = '-';
                  if(dataU81.L.Lmm != ''){lengthPercel = lengthCalib - dataU81.L.Lmm;}
                  if(dataU81.W.Wmm != ''){widthPercel= widthCalib - dataU81.W.Wmm;}
                  if(dataU81.H.Hmm != ''){heightPercel = heightCalib - dataU81.H.Hmm;}
                  dataSubmit.Items[0].Length = dataGDAQ.length = lengthPercel;
                  dataSubmit.Items[0].Height = dataGDAQ.height = widthPercel;
                  dataSubmit.Items[0].Width = dataGDAQ.width = heightPercel;
                  dataGDAQ.created_at = dataU81.Time;
                  CalWeight = calCulate.Cal(dataBarcode.toString(), isAirmail, lengthPercel, widthPercel, heightPercel);
                  //console.log(massWeight);
                  if(CalWeight =='---'){priceWeight ='---'}
                  else if(CalWeight>massWeight){priceWeight = CalWeight;}else{ priceWeight = massWeight;}
                  if(CalWeight != '---'){dataSubmit.Items[0].WeightConvert =CalWeight;}
                  dataGDAQ.calweight = CalWeight;
                  dataGDAQ.priceweight = priceWeight;
                  check2 = dataU81.check
                  
                  /////////////emit data////////////////////////////////////////////////////////////////
                  io.sockets.emit('u81', {length:lengthPercel, width: widthPercel, height:  heightPercel, calculateWeight : CalWeight, pWeight: priceWeight, msgL: dataU81.L.message, msgH: dataU81.H.message, msgW: dataU81.W.message, sqL: dataU81.L.signalQuality, sqH: dataU81.H.signalQuality, sqW: dataU81.W.signalQuality});
                  u81Controller.onLaserU81(portSS,u81Controller.constU81.onLaserSS1,u81Controller.constU81.onLaserSS2, u81Controller.constU81.onLaserSS3);   
                  diffWeight = priceWeight - priceWeightVNP;
                  dataGDAQ.diffweight = diffWeight;
                  dataGDAQ.priceweightVNP = priceWeightVNP;
                  rate = ((diffWeight*100)/priceWeight).toFixed(2);
                  dataGDAQ.rate = rate;
                  io.emit('dataVNP', {weight: massWeightVNP, calweight: CalWeightVNP, priceweight: priceWeightVNP, length: lengthVNP, width: widthVNP, height: heightVNP, diffW: diffWeight, Rate: rate, isAir: isAirmail, svrCode: serviceCode});
                  if(diffWeight>300){dataSubmit.Items[0].isWrong = true; dataGDAQ.isWrong = true;}else{dataSubmit.Items[0].isWrong=false; dataGDAQ.isWrong=false}
                  
                  takePictureCam.then((PicturePath, err)=>{
                      if (err) throw err;
                      dataGDAQ.pathPicture = (PicturePath.split("../public"))[1].toString();
                      var picturepath = PicturePath;
                      console.log(picturepath);
                      io.sockets.emit('picture', {picturePath:  PicturePath});//.split("../public")
                      //console.log(dataGDAQ);
                  });
                  knex.select().table('sendConfig').then((data)=>{
                    data.map(function(row){
                      sendType = row.type;
                    })
                  })
                  if(check1 ==1&&check2==1 &&sendType ==1){ //In cases: khong co bat ki loi trong phep do
                    dataGDAQ.check = 1;
                    if(serviceCode != 'L'){
                    console.log(JSON.stringify(dataSubmit));
                    serviceVNP.vnpService.submitData(JSON.stringify(dataSubmit)).then((data)=>{
                    var status = (JSON.parse(data)).MSG_CODE;
                    if(status ==true){io.sockets.emit('submitStatus', {status: true});
                    console.log("Gui thanh cong"); 
                    dataGDAQ.isSent= 1;}
                    else{
                      io.sockets.emit('submitStatus', {status: false}); 
                      dataGDAQ.isSent= 0;
                    }
                    knex('tbdata').insert(dataGDAQ).then((result)=>{
                      console.log("success insert to DB ! ");
                    });
                    knex('rawdata').insert(rawData).then(()=>{
                      console.log("success insert to DB ! ");
                    });
                    });
                  }
                }else{
                  dataGDAQ.check = 0;
                  knex('tbdata').insert(dataGDAQ).then((result)=>{
                    console.log("success insert to DB ! ");
                  });
                  knex('rawdata').insert(rawData).then(()=>{
                    console.log("success insert to DB ! ");
                  });
                }
              });
          })
      })
  });
}catch{
  console.log("ERROR BARCODE");
}
////////////////////////////////////
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;


  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
module.exports.io = io;