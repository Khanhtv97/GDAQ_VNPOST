
/* Request data from VNPOST Function */ 
let request = require('request');
var serverURL = 'http://thongtinphat.vnpost.vn';

function getSrvVnp(token, itemCode){
    var getDetail_options = {
        'method': 'GET',
        'url': serverURL + '/ServiceApiCanDT/serviceApi/v1/GetItemWeight?Token=' + token+'&ItemCode='+itemCode,
        'headers': {
        'Content-Type': 'application/json'
        }
     };

     return new Promise( (resolve, reject) => {
        request(getDetail_options, (err, res) => {
            if( err ){
                return reject(err);
            }
            //console.log(res.body);
            resolve(res.body);
        });
    });
}

//getServiceVnpost('26d9acda5b31ebc7fdf6095a0808b7c0', 'CH167101882VN');
module.exports.vnpService = getSrvVnp;