var app = require('../app');
var debug = require('debug')('angular2-nodejs:server');
var http = require('http');
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

var dataGDAQ = {barcode: "", massweight:"", calweight: "", priceweight: "", diffweight: "", rate: "", length: "",width: "", height: "", massweightVNP: "", calweightVNP: "", priceweightVNP: "", lengthVNP: "", widthVNP: "", heightVNP: "", pathPicture: "",rawU81: "", rawScale: ""}
let massWeight ='';
let CalWeight = '';
let priceWeight ='';
let massWeightVNP ='-';
let CalWeightVNP = '-';
let priceWeightVNP ='-';
let lengthVNP = '-';
let heightVNP = '-';
let widthVNP = '-';
let isAirmail = ''; 
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
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
/*Listen Event barcode to Emit data */

// function Calculate(barcode, IsAirmail, length, width, height){
//   var serviceCode = barcode.substring(0,1);
//   if((serviceCode== 'C'||serviceCode=='P'||serviceCode=='U') && IsAirmail==false){
//       return ((length*width*height)/4000).toFixed(0);
//   }
//   else{
//       return ((length*width*height)/6000).toFixed(0);
//   }
// }


///////////////get data Calib sensors from DB/////////////////////////
knex.select().table('tbcalibSS').then((data)=>
  {
    data.map(function(row){
    lengthCalib = row.calibLength;
    widthCalib = row.calibWidth;
    heightCalib = row.calibHeight;
});
  });
/////////////////////////////////////////////////////////////


/* */
barcodeController.portBarcode.on('data', (dataBarcode)=>{
  console.log(dataBarcode.toString());
  var takePictureCam = new cameraController.takePicture();
  const portScale = new SerialPort('/dev/ttyUSB1', { baudRate: 19200, dataBits: 8, parity: 'none', parsers: new Readline("\r\n")});
  const portSS = new SerialPort('/dev/ttyUSB0', { baudRate: 19200, dataBits: 8, parity: 'none'});
  dataGDAQ.barcode = dataBarcode.toString();
  io.sockets.emit('barcode', {barcode: dataBarcode.toString()});
  serviceVNP.vnpService(token, dataBarcode.toString()).then((svrRes)=>{
    
    dataVNP = JSON.parse(svrRes);
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
    if(massWeightVNP>CalWeightVNP){priceWeightVNP = massWeightVNP;}
    else{priceWeightVNP=CalWeightVNP;}
  });
  scaleController.getdataScale(portScale).then((dataScale)=>{
      console.log(dataScale);
      massWeight = dataScale.weigh*1000;
      dataGDAQ.massweight = massWeight;
      dataGDAQ.rawScale = JSON.stringify(dataScale);
      io.sockets.emit('weight', {massweight: massWeight, h1: dataScale.header1, msg: dataScale.message});
  });
  u81Controller.OneShotReadU81(portSS, u81Controller.constU81.oneshot1,u81Controller.constU81.oneshot2, u81Controller.constU81.oneshot3).then((dataU81)=>{
      console.log(dataU81);
      dataGDAQ.rawU81 = JSON.stringify(dataU81);
        //console.log(lengthCalib-widthCalib);
        //push data to object
        var lengthPercel ='-';
        var heightPercel = '-';
        var widthPercel = '-';
        if(dataU81.L.Lmm != ''){lengthPercel = lengthCalib - dataU81.L.Lmm;}
        if(dataU81.W.Wmm != ''){widthPercel= widthCalib - dataU81.W.Wmm;}
        if(dataU81.H.Hmm != ''){heightPercel = heightCalib - dataU81.H.Hmm;}
        dataGDAQ.length = lengthPercel;
        dataGDAQ.height = widthPercel;
        dataGDAQ.width = heightPercel;
        CalWeight = calCulate.Cal(dataBarcode.toString(), isAirmail, lengthPercel, widthPercel, heightPercel);
        //console.log(massWeight);
        if(CalWeight>massWeight){
          priceWeight = CalWeight;
        }else{ priceWeight = massWeight;}
        dataGDAQ.calweight = CalWeight;
        dataGDAQ.priceweight = priceWeight;
        /////////////emit data////////////////////////////////////////////////////////////////
        io.sockets.emit('u81', {length:lengthPercel, width: widthPercel, height:  heightPercel, calculateWeight : CalWeight, pWeight: priceWeight, msgL: dataU81.L.message, msgH: dataU81.H.message, msgW: dataU81.W.message});
      
      u81Controller.onLaserU81(portSS,u81Controller.constU81.onLaserSS1,u81Controller.constU81.onLaserSS2, u81Controller.constU81.onLaserSS3);
      // 
      diffWeight = priceWeight - priceWeightVNP;
      dataGDAQ.diffweight = diffWeight;
      dataGDAQ.priceweightVNP = priceWeightVNP;
      rate = ((diffWeight*100)/priceWeight).toFixed(2);;
      io.emit('dataVNP', {weight: massWeightVNP, calweight: CalWeightVNP, priceweight: priceWeightVNP, length: lengthVNP, width: widthVNP, height: heightVNP, diffW: diffWeight, Rate: rate, isAir: isAirmail});
      takePictureCam.then((PicturePath, err)=>{
        if (err) throw err;
        dataGDAQ.pathPicture = "http://localhost:3000"+(PicturePath.split("../public"))[1].toString();
        var picturepath = PicturePath;
        console.log(picturepath);
        io.sockets.emit('picture', {picturePath:  PicturePath});//.split("../public")
        //console.log(dataGDAQ);
        knex('tbdata').insert(dataGDAQ).then((result)=>{
          console.log("success insert to DB ! ");
        });
    });
  })
});
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
