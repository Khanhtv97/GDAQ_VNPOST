const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;
const portBarcode = new SerialPort('/dev/ttyS5', { baudRate: 9600, stopBits: 1,dataBits: 8, parity: 'none', autoOpen: false, parsers: new Readline("\r\n")});


//
var fs = require('fs');
var request = require('request'),
    username = "admin",
    password = "Gbs123456",
    url = "http://192.168.0.22/ISAPI/Streaming/channels/101/picture",
    auth = "Basic " + new Buffer.from(username + ":" + password).toString("base64");

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './GDAQ.db',
    },
  });
   
  // Create a table
  knex.schema
    .createTable('test', function(table) {
      table.string('barcode');
      table.string('images');
    })
    .catch(function(e) {
        console.error(e);
      });

//
portBarcode.open((err)=>{
    if(err){
        console.log(err);
    }
})
portBarcode.on('data', (data)=>{
    // let chunk;
    // chunk = portBarcode.read()
    // if(chunk != null){
    // resolve(chunk.toString());
    // portBarcode.close();
    if(data!=null){
    console.log(data.toString());
    let file = fs.createWriteStream('/public/imagesItem/'+Date.now()+'.jpg'); 
    return new Promise((resolve, reject) => {
        let stream = request({
            url : url,
            headers : {
                "Authorization" : auth
            },
            //gzip: true
        })
        .pipe(file)
        .on('finish', () => {
            console.log(`The file is finished downloading.`);
            console.log(file.path+data);
            knex.schema.then(function() {
                return knex('test').insert({ barcode: data, images: file.path });
              });
            resolve();
        })
        .on('error', (error) => {
            reject(error);
        })
    })
    .catch(error => {
        console.log(`Something happened: ${error}`);
    });
    }
    // }
});