const SerialPort = require('serialport'),
      Readline = SerialPort.parsers.Readline
const knex = require('knex')(require('../model/connection'));
function getportBarcode(){
    return new Promise((resolve, reject) =>{
        knex('devices').where('devicecode', 'GBSBarcode').select().then((data)=>{
            data.map(function(row){
                 //{port: row.port,bauw.bdRate: roaurate, dataBits: row.databits, parity: row.parity }
                resolve(row);
            });
        }).catch (err=> reject(err));
    })
}

// getportBarcode().then((data)=>{
//     const portBarcode = new SerialPort(data.port, { baudRate: data.baurate, stopBits: data.stopbits,dataBits: data.databits, parity: data.parity, autoOpen: true});//, parsers: new Readline("\r\n")  
//     portBarcode.on('data', (data)=>{
//         //console.log(data.toString());
//     })
   
// })
module.exports.portBarcode = getportBarcode;

      

