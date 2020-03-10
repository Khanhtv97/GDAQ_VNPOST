var fs = require('fs');
const request = require('request'),
    username = "admin",
    password = "Gbs123456",
    url = "http://192.168.0.22/ISAPI/Streaming/channels/101/picture",
    auth = "Basic " + new Buffer.from(username + ":" + password).toString("base64");

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
let datetime = year+ month + date +hours +minutes + seconds;
    ///home/khanhtong/Nodejs/WEBGDAQ/public/imagesItem
function takePicture(){
    let files = fs.createWriteStream('../public/imagesItem/'+Date.now()+'.jpg');
    return new Promise((resolve, reject) => {
        let takepicture = request({
            url : url,
            headers : {
                "Authorization" : auth
            },
            //gzip: true
        })
        .pipe(files)
        .on('finish', () => {
            resolve(files.path);
            
        })
        .on('error', (error) => {
            reject (error);
        })
    })
    .catch(error => {
        console.log(`Something happened: ${error}`);
    });
}
// takePicture().then((data)=>{
//     console.log(data);
// });

module.exports.takePicture = takePicture;