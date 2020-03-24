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
try{
barcodeController.portBarcode().then((data)=>{
    const portBarcode = new SerialPort(data.port, { baudRate: data.baurate, stopBits: data.stopbits,dataBits: data.databits, parity: data.parity, autoOpen: true});//, parsers: new Readline("\r\n")  
    portBarcode.on('data', function(dataBarcode){
        console.log(dataBarcode.toString());
        var takePictureCam = new cameraController.takePicture();
        rawData.barcode = dataGDAQ.barcode = dataBarcode.toString();
        io.sockets.emit('barcode', {barcode: dataBarcode.toString()});
        serviceVNP.vnpService.getSrvVnp(token, dataBarcode.toString()).then((svrRes)=>{
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
            serviceCode = dataVNP.ServiceCode;
            if(massWeightVNP>CalWeightVNP){priceWeightVNP = massWeightVNP;}
            else{priceWeightVNP=CalWeightVNP;}
          });
        scaleController.portScale().then((dataPScale)=>{
            const portScale = new SerialPort(dataPScale.port, { baudRate:dataPScale.baurate, dataBits: dataPScale.databits, parity: dataPScale.parity, parsers: new Readline("\r\n")});
            scaleController.getdataScale(portScale).then((dataScale)=>{
                console.log(dataScale);
                massWeight = dataScale.weigh*1000;
                dataGDAQ.massweight = massWeight;
                rawData.rawScale = JSON.stringify(dataScale);
                io.sockets.emit('weight', {massweight: massWeight, h1: dataScale.header1, msg: dataScale.message});
            });
        });
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
                dataGDAQ.length = lengthPercel;
                dataGDAQ.height = widthPercel;
                dataGDAQ.width = heightPercel;
                dataGDAQ.created_at = dataU81.Time;
                CalWeight = calCulate.Cal(dataBarcode.toString(), isAirmail, lengthPercel, widthPercel, heightPercel);
                //console.log(massWeight);
                if(CalWeight>massWeight){priceWeight = CalWeight;}else{ priceWeight = massWeight;}
                dataGDAQ.calweight = CalWeight;
                dataGDAQ.priceweight = priceWeight;
                /////////////emit data////////////////////////////////////////////////////////////////
                io.sockets.emit('u81', {length:lengthPercel, width: widthPercel, height:  heightPercel, calculateWeight : CalWeight, pWeight: priceWeight, msgL: dataU81.L.message, msgH: dataU81.H.message, msgW: dataU81.W.message});
                u81Controller.onLaserU81(portSS,u81Controller.constU81.onLaserSS1,u81Controller.constU81.onLaserSS2, u81Controller.constU81.onLaserSS3);   
                diffWeight = priceWeight - priceWeightVNP;
                dataGDAQ.diffweight = diffWeight;
                dataGDAQ.priceweightVNP = priceWeightVNP;
                rate = ((diffWeight*100)/priceWeight).toFixed(2);
                dataGDAQ.rate = rate;
                io.emit('dataVNP', {weight: massWeightVNP, calweight: CalWeightVNP, priceweight: priceWeightVNP, length: lengthVNP, width: widthVNP, height: heightVNP, diffW: diffWeight, Rate: rate, isAir: isAirmail, svrCode: serviceCode});
                takePictureCam.then((PicturePath, err)=>{
                    if (err) throw err;
                    dataGDAQ.pathPicture = (PicturePath.split("../public"))[1].toString();
                    var picturepath = PicturePath;
                    console.log(picturepath);
                    io.sockets.emit('picture', {picturePath:  PicturePath});//.split("../public")
                    //console.log(dataGDAQ);
                    knex('tbdata').insert(dataGDAQ).then((result)=>{
                      console.log("success insert to DB ! ");
                    });
                    knex('rawdata').insert(rawData).then(()=>{
                      console.log("success insert to DB ! ");
                    });
                });
            });

        })
    })
});
}catch{

}
   // console.log(dataBarcode.toString());
  //  var takePictureCam = new cameraController.takePicture();
    //const portScale = new SerialPort('/dev/ttyUSB1', { baudRate: 19200, dataBits: 8, parity: 'none', parsers: new Readline("\r\n")});
    //const portSS = new SerialPort('/dev/ttyUSB0', { baudRate: 19200, dataBits: 8, parity: 'none'});
    //dataGDAQ.barocde = dataBarcode.toString();
    // scaleController.getdataScale(portScale).then((dataScale)=>{
    //     console.log(dataScale);
    //     dataGDAQ.massweigh = dataScale.weigh;
    // });
    // u81Controller.OneShotReadU81(portSS, u81Controller.constU81.oneshot1,u81Controller.constU81.oneshot2, u81Controller.constU81.oneshot3).then((dataU81)=>{
    //     console.log(dataU81);
    //     dataGDAQ.length = dataU81.L.Lmm;
    //     dataGDAQ.height = dataU81.H.Hmm;
    //     dataGDAQ.width = dataU81.W.Wmm;
    //     u81Controller.onLaserU81(portSS,u81Controller.constU81.onLaserSS1,u81Controller.constU81.onLaserSS2, u81Controller.constU81.onLaserSS3);   
    // });
    // takePictureCam.then((PicturePath, err)=>{
    //     if (err) throw err;
    //     console.log(PicturePath);
    //     dataGDAQ.pathPicture = PicturePath;
        
    // });
    // knex('tbdata').insert(dataGDAQ).then((result)=>{
    //     console.log("success insert to DB ! ");
    //     });









