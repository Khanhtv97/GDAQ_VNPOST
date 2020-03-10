const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;

// portScale.open((err)=>{
//     if(err){
//         console.log(err);
//     }
// })
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
function parserDataScale(rawData){
    var dataObj = {header1: "", header2: "", sign: "",weigh: "", unit: "", message: ""};
    Header1 = rawData.substring(0, 2);
    Header2 = rawData.substring(3, 5);
    Sign = rawData.substring(6, 7);
    Weight = rawData.substring(7, 14);
    Unit = rawData.substring(14, 16);
    dataObj.header1 = Header1;
    dataObj.header2 = Header2;
    dataObj.sign = Sign;
    dataObj.weigh = Weight;
    dataObj.unit =Unit;
    if(Header1 == 'US'){
        dataObj.message = "Cân không ổn định, Chờ ổn định và quét lại !";
    }
    else if (Header1 =="OL"){
       dataObj.message = "Cân quá tải !";
    }
    return dataObj;
}
function readData(port) {
    return new Promise((resolve, reject) => {
        port.on('readable', ()=>{
            let chunk;
            chunk = port.read(18)
            if(chunk != null){
            resolve(parserDataScale(chunk.toString()));
            port.close();
            }
        });
        port.once('error', (err) => {
            reject(err);
        });
    });
}
// readData(portScale).then((data)=>{
//     console.log(parserDataScale(data));
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
//module.exports.portScale = portScale;