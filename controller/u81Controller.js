var converter = require('hex2dec');
const multiSlaves = Buffer.from([0xAA, 0x7F, 0x00, 0x20, 0x00, 0x01, 0x00, 0x00, 0xA0]);
const readSS1 = Buffer.from([ 0xAA, 0x81, 0x00, 0x22, 0xA3 ]);
const readSS2 = Buffer.from([ 0xAA, 0x82, 0x00, 0x22, 0xA4 ]);
const readSS3 = Buffer.from([ 0xAA, 0x83, 0x00, 0x22, 0xA5 ]);
const onLaserSS1 = Buffer.from([0xAA, 0x01, 0x01, 0xBE, 0x00, 0x01, 0x00, 0x01, 0xC2]);
const offLaserSS1 = Buffer.from([0xAA, 0x01, 0x01, 0xBE, 0x00, 0x01, 0x00, 0x00, 0xC1]);
const onLaserSS2 = Buffer.from([0xAA, 0x02, 0x01, 0xBE, 0x00, 0x01, 0x00, 0x01, 0xC3]);
const onLaserSS3 = Buffer.from([0xAA, 0x03, 0x01, 0xBE, 0x00, 0x01, 0x00, 0x01, 0xC4]);
const continus1 = Buffer.from([0xAA, 0x01, 0x00, 0x20, 0x00, 0x01, 0x00, 0x06, 0x28]);
const oneshot1 = Buffer.from([0xAA, 0x01, 0x00, 0x20, 0x00, 0x01, 0x00, 0x02, 0x24]);
const oneshot2 = Buffer.from([0xAA, 0x02, 0x00, 0x20, 0x00, 0x01, 0x00, 0x02, 0x25]);
const oneshot3 = Buffer.from([0xAA, 0x03, 0x00, 0x20, 0x00, 0x01, 0x00, 0x02, 0x26]);
const SerialPort = require('serialport'); 
const ideaSQ = 120;
//const portSS = new SerialPort('/dev/ttyUSB0', { baudRate: 19200, dataBits: 8, parity: 'none'});
//const Readline = SerialPort.parsers.Readline;
//const portScale = new SerialPort('COM4', { baudRate: 19200, dataBits: 8, parity: 'none'});

//const parser = port.pipe(new Readline({delimiter: '\n\r'}));
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
// portScale.open(function (err) {
//     if (err) {
//       return console.log("Scale: "+err.message);
//     }
// });
// portScale.on('data', function (data) {
//     console.log('Data:', data.toString())
// });
function parserDataU81(rawData){
    var t1 = rawData.indexOf("aa010022");
    var t2 = rawData.indexOf("ee010000");
    var t3 = rawData.indexOf("aa020022");
    var t4 = rawData.indexOf("ee020000");
    var t5 = rawData.indexOf("aa030022");
    var t6 = rawData.indexOf("ee030000");
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let datetime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    var data = {Time: datetime, W: "", H:"", L:"", rawData: rawData, check: ""};
    var width = {errorCode: "", Wmm: "", signalQuality: "", message: ""};
    var height = {errorCode: "", Hmm: "", signalQuality: "", message: ""};
    var length = {errorCode: "", Lmm: "", signalQuality: "", message: ""};
    let rawWith;
    let rawHeight;
    let rawLength;
    if(t1 != -1){
        rawWith = rawData.substring(t1, t1+26);
        width.errorCode = "00";
        width.Wmm = converter.hexToDec("0x"+rawWith.substring(12,20));
        sqW = converter.hexToDec("0x"+rawWith.substring(20, 24));
        width.signalQuality = sqW;
        if(sqW>ideaSQ){
            width.message = "Rộng SQ="+sqW+": Chất lượng đo kém, hãy dùng tấm chắn !"
        }
    }
    else if (t2 !=-1){
        rawWith = rawData.substring(t2, t2+18);
        width.errorCode = rawWith.substring(14, 16);
        width.message = 'Rộng: '+ getErrorMessage(rawWith.substring(14, 16));
    }
    if(t3 != -1){
        rawHeight =  rawData.substring(t3, t3+26);
        height.errorCode = "00";
        height.Hmm = converter.hexToDec("0x"+rawHeight.substring(12,20));
        sqH = converter.hexToDec("0x"+rawHeight.substring(20, 24));
        height.signalQuality = sqH;
        if(sqH>ideaSQ){
            height.message = "Cao SQ="+sqH+": Chất lượng đo kém, hãy dùng tấm chắn !"
        }
    }
    else if (t4 !=-1){
        rawHeight =  rawData.substring(t4, t4+18);
        height.errorCode = rawHeight.substring(14, 16);
        height.message = 'Cao: '+getErrorMessage(rawHeight.substring(14, 16));
    }
    if(t5 != -1){
        rawLength =  rawData.substring(t5, t5+26);
        length.errorCode = "00";
        length.Lmm = converter.hexToDec("0x"+rawLength.substring(12,20));
        sqL = converter.hexToDec("0x"+rawLength.substring(20, 24));
        length.signalQuality = sqL;
        if(sqL>ideaSQ){
            length.message = "Dài SQ="+sqL+": Chất lượng đo kém, hãy dùng tấm chắn !"
        }
    }
    else if (t6 !=-1){
        rawLength =  rawData.substring(t6, t6+18);
        length.errorCode = rawLength.substring(14, 16);
        length.message =  'Dai: '+getErrorMessage(rawLength.substring(14, 16));
    }
    data.W =width;
    data.H = height;
    data.L = length;
    if(width.message!=''&&length.message!=''&&height.message!=''){ data.check =1;} //message != null mean with no error
    else{data.check=0;}
    return data;
}
function getErrorMessage(code){
    switch(code){
        case "01":
            return  "01 Nguon nuoi sensor thap, bao ky thuat vien !";
        case "02":
            return "02 Loi noi bo, do lai !";
        case "03":
            return "03 Nhiet do < 20 do. Suoi am sensor.";
        case "04":
            return "04 Nhiet do > 40 do. Lam mat sensor.";
        case "05":
            return "05 Vat can ngoai dai do. Kiem tra lai tia";
        case "06":
            return "06 Ket qua do loi, Buu kien ngoai dai do.";
        case "07":
            return "07 Anh sang nen qua manh, tat bot den.";
        case "08":
            return "08 Anh sang laser yeu, Hay dung tam chan va do lai";
        case "09":
            return "09 Laser qua manh, Hay dung tam chan va do lai";
        case "0f":
            return "0F Laser không ổn định, hãy dùng tấm chắn và đo lại";
        case "0a"||"0b"||"0b"||"0c"||"0d"||"0e":
            return  "Lỗi, đo lại";
    }
}
function writeAndDrain (port, data, callback) {
    port.write(data);
    port.drain(callback);
  }
function sendOneShotRead(port, cmd1, cmd2, cmd3) {
    return new Promise((resolve, reject) => {
        writeAndDrain(port, cmd1, ()=>{
            sleep(800);
            writeAndDrain(port, cmd2, ()=>{
                sleep(400);
                writeAndDrain(port, cmd3, ()=>{
                    sleep(600);
                    // port.once('data', (data) => {
                    // resolve(data.toString('hex'));
                    // });
                    port.on('readable', ()=>{
                        let chunk;
                        while (null !== (chunk = port.read())) {
                            resolve(parserDataU81 (chunk.toString('hex')));
                          }
                    });
                    port.once('error', (err) => {
                    reject(err);
                    });
                });
            });

        });
        
    });
}
function sendonLaser(port, cmd1, cmd2, cmd3) {
    return new Promise((resolve, reject) => {
        writeAndDrain(port, cmd1, ()=>{
            sleep(200);
            writeAndDrain(port, cmd2, ()=>{
                sleep(200);
                writeAndDrain(port, cmd3, ()=>{
                    sleep(300);
                    port.close();
                });
            });
        });
    });
}
function setAddressSS(port, cmd){
    return new Promise((resolve, reject)=>{
        writeAndDrain(port, cmd, ()=>{
            sleep(300);
            port.close();
        });

    });

}

// portSS.open((err)=>{
//     if(err){
//         console.log(err);
//     }
// });
// module.exports.dataU81 = function(){
// sendOneShotRead(portSS, oneshot1, oneshot2, oneshot3).then((data) => {
//         return (parserDataU81(data));
//         sendonLaser(portSS, onLaserSS1, onLaserSS2, onLaserSS3);
//     });
// }
// parserDataU81 getErrorMessage writeAndDrain sendOneShotRead sendonLaser
module.exports.parserDataU81 = parserDataU81;
// module.exports.getErrorMessageU81 = getErrorMessage;
// module.exports.writeAndDrain = writeAndDrain;
module.exports.OneShotReadU81 = sendOneShotRead;
module.exports.onLaserU81 = sendonLaser;
module.exports.constU81 ={
   oneshot1, oneshot2, oneshot3, onLaserSS1, onLaserSS2, onLaserSS3
}







