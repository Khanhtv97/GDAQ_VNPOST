const SerialPort = require('serialport'); 
const knex = require('knex')(require('../model/connection'));
const Readline = SerialPort.parsers.Readline;
//const portScalex = new SerialPort('/dev/ttyUSB0', { baudRate: 38400, dataBits: 8, parity: 'none', parsers: new Readline("\r\n")});
function getportScale(){
    return new Promise((resolve, reject) =>{
        knex('devices').where('devicecode', 'GBSScale').select().then((data)=>{
            data.map(function(row){
             //{port: row.port,bauw.bdRate: roaurate, dataBits: row.databits, parity: row.parity }
                resolve(row);
            });
        }).catch (err=> reject(err));
    })
}
//sleep(2000);
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
function parserDataScale(rawData){
    var dataObj = {header1: "", header2: "", sign: "",weigh: "", unit: "", message: "", raw:"", check: ""};
    t1 = rawData.indexOf("ST");
    t2 = rawData.indexOf("US");
    t3 = rawData.indexOf("OT");
    var raw;
    if(t1 != -1){raw = rawData.substring(t1, t1 +18);}
    else if (t2 != -1){raw = rawData.substring(t2, t2 +18);}
    else if(t3 != -1){raw = rawData.substring(t3, t3 +18);}
    Header1 = raw.substring(0, 2);
    Header2 = raw.substring(3, 5);
    Sign = raw.substring(6, 7);
    Weight = raw.substring(7, 14);
    Unit = raw.substring(14, 16);
    dataObj.header1 = Header1;
    dataObj.header2 = Header2;
    dataObj.sign = Sign;
    dataObj.weigh = Weight;
    dataObj.unit =Unit;
    if(Header1 == 'US'){dataObj.message = "Cân không ổn định, Chờ ổn định và quét lại !";dataObj.check =0;}
    else if (Header1 =="OL"){dataObj.message = "Cân quá tải !"; dataObj.check =0;}
    else if(Header1=='ST'){dataObj.check =1;}
    else{dataObj.message ="Can chua san sang, cho 2s va quet lai !"; dataObj.check =0;}
    dataObj.raw = rawData;
    return dataObj;
}
function readData(port) {
    return new Promise((resolve, reject) => {
        port.on('readable', ()=>{
            let chunk;
            chunk = port.read(90)
            if(chunk){
            resolve(parserDataScale(chunk.toString()));
            port.close();
            }
        });
        port.once('error', (err) => {
            reject(err);
        });
    });
}
// readData(portScalex).then((data)=>{
//     console.log(data);
// });
// getportScale().then((data)=>{
//     const portScale = new SerialPort(data.port, { baudRate:data.baurate, dataBits: data.databits, parity: data.parity, parsers: new Readline("\r\n")});
//     readData(portScale).then((datax)=>{
//         console.log(datax);
//     });
// });

// portScale.on('readable', ()=>{
//     let dataScale;
//     dataScale = portScale.read(18)
//     if(dataScale != null){
//     console.log (parserDataScale(dataScale.toString()));
//     portScale.close();
//     }
// });
module.exports.getdataScale = readData;
module.exports.portScale = getportScale;
//module.exports.portScale = portScale;