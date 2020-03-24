
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

function submitData(pakage){
    var datalog_options = {
        'method': 'POST',
        'url': 'https://ktkl-bccp.vnpost.vn/serviceApi/v1/API_Add_Items',
        'headers': {
            'Content-Type': 'application/json',
        },
        body: pakage
    }
    return new Promise( (resolve, reject) => {
        request(datalog_options, (err, res) => {
            if( err ){
                return reject(err);
            }
            console.log(res.body);
            resolve(res.body);
        });
    });
}
function getdataVNP(date){
    var datalog_options = {
        'method': 'POST',
        'url': 'https://ktkl-bccp.vnpost.vn/serviceApi/v1/GetItems',
        'headers': {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"date":date,"Token":"ed4ee293-cf53-425a-bf07-2df9d4fe8ba1"})
    }
    return new Promise( (resolve, reject) => {
        request(datalog_options, (err, res) => {
            if( err ){
                return reject(err);
            }
            //console.log(res.body);
            resolve(res.body);
        });
    });
}
// var datas = JSON.stringify({
//     "Items": [
//     {
//     "ItemCode": "CA122001010VN",
//     "POSCode": "100910",
//     "Weight": "800.2",
//     "Length": "15",
//     "Width": "30",
//     "Height": "40",
//     "WeightConvert": "5000",
//     "isWrong": "1"
//     },
//     {
//     "ItemCode": "CA122001008VN",
//     "POSCode": "100910",
//     "Weight": "9500",
//     "Length": "20",
//     "Width": "20",
//     "Height": "50",
//     "WeightConvert": "5000",
//     "isWrong": "1"
//     },
//     {
//         "ItemCode": "CA122001008VN",
//         "POSCode": "100910",
//         "Weight": "9500",
//         "Length": "20",
//         "Width": "20",
//         "Height": "50",
//         "WeightConvert": "5000",
//         "isWrong": "1"
//         }
//     ],
//     "Token": "ed4ee293-cf53-425a-bf07-2df9d4fe8ba1"
//     })
// getdataVNP(20200320).then((data)=>{
//     console.log(data);
// })
// submitData(datas).then((data)=>{
//     console.log(data);
// });

//{"ItemCode":"CH167101882VN","AcceptancePOSCode":"163511","POSName":"Bưu Cục KHL-TMĐT Văn Lâm","rootUnitCode":"16","rootUnitName":"Bưu điện Tỉnh Hưng Yên","Weight":5860.0,"Width":40.0,"Height":10.0,"Length":50.0,"WeightConvert":5000.0,"IsAirmail":false,"ServiceCode":"C"}

// getSrvVnp('26d9acda5b31ebc7fdf6095a0808b7c0', 'LA670001830VN').then((data)=>{
//     console.log(data);
// });
module.exports.vnpService = {getSrvVnp, submitData, getdataVNP};