const SerialPort = require('serialport'),
      Readline = SerialPort.parsers.Readline,
      portBarcode = new SerialPort('/dev/ttyS5', { baudRate: 9600, stopBits: 1,dataBits: 8, parity: 'none', autoOpen: true});//, parsers: new Readline("\r\n")

module.exports.portBarcode = portBarcode;
