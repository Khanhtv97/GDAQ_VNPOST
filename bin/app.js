var u81Controller = require('../controller/u81Controller');
var scaleController = require('../controller/scaleController');
var barcodeController = require('../controller/barcodeController');
var cameraController = require('../controller/cameraController');
var io = require('socket.io');
const knex = require('knex')(require('../model/connection'));
const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;
var dataGDAQ = {barocde: "", massweigh:"", calweigh: "", priceweigh: "", diffweigh: "", rate: "", length: "",width: "", height: "", massweighVNP: "", calweighVNP: "", priceweighVNP: "", lengthVNP: "", widthVNP: "", heightVNP: "", pathPicture: ""}

//  knex('tbdata').insert({ barocde: dataBarcode.toString(), massweigh: '12345', calweigh: "380", priceweigh: '380'}).then((result)=>{
    //console.log("sucess !");

//});
barcodeController.portBarcode.on('data', (dataBarcode)=>{
    console.log(dataBarcode.toString());
    var takePictureCam = new cameraController.takePicture();
    const portScale = new SerialPort('/dev/ttyUSB1', { baudRate: 19200, dataBits: 8, parity: 'none', parsers: new Readline("\r\n")});
    const portSS = new SerialPort('/dev/ttyUSB0', { baudRate: 19200, dataBits: 8, parity: 'none'});
    dataGDAQ.barocde = dataBarcode.toString();
    scaleController.getdataScale(portScale).then((dataScale)=>{
        console.log(dataScale);
        dataGDAQ.massweigh = dataScale.weigh;
    });
    u81Controller.OneShotReadU81(portSS, u81Controller.constU81.oneshot1,u81Controller.constU81.oneshot2, u81Controller.constU81.oneshot3).then((dataU81)=>{
        console.log(dataU81);
        dataGDAQ.length = dataU81.L.Lmm;
        dataGDAQ.height = dataU81.H.Hmm;
        dataGDAQ.width = dataU81.W.Wmm;
        u81Controller.onLaserU81(portSS,u81Controller.constU81.onLaserSS1,u81Controller.constU81.onLaserSS2, u81Controller.constU81.onLaserSS3);   
    });
    takePictureCam.then((PicturePath, err)=>{
        if (err) throw err;
        console.log(PicturePath);
        dataGDAQ.pathPicture = PicturePath;
        
    });
    knex('tbdata').insert(dataGDAQ).then((result)=>{
        console.log("success insert to DB ! ");
        });
});









