const knex = require('knex')(require('../model/connection'));
var serviceVNP = require('../services/ServiceVnpost');

function submitdataByID(req, res){
    const package= {Items: [], Token: "ed4ee293-cf53-425a-bf07-2df9d4fe8ba1"};
    var id = (req.body.id).split(",");
    for (var i=0; i<id.length; i++)
    {
        id[i] = parseInt(id[i], 10);
    }
    knex.select().table('tbdata').whereIn('id', id).then((data)=>{
        if(data.length){ 
            for(var i = 0;i < data.length;i++) {
                package.Items.push({
                    ItemCode: data[i].barcode,
                    POSCode: 100910, //data[i].poscode
                    Weight: data[i].massweight,
                    Length: data[i].length,
                    Width: data[i].width,
                    Height: data[i].height,
                    WeightConvert: data[i].calweight,
                    isWrong: data[i].isWrong
                })
            }
            console.log(package);
            serviceVNP.vnpService.submitData(JSON.stringify(package)).then((result)=>{
                if((JSON.parse(result).MSG_CODE)==true){
                    knex('tbdata').whereIn('id', id).update('isSent', true).then((res)=>{

                    });
                    knex.select().table('tbdata').orderBy('id', 'desc').where({'check': true, 'isSent': false}).then((datax)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
                    {
                      res.render('dataSubmit', {dataGDAQ: datax, messages: "Gửi dữ liệu thành công !"});
                    })

                }else{knex.select().table('tbdata').orderBy('id', 'desc').where({'check': true, 'isSent': false}).then((datax)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
                {
                  res.render('dataSubmit', {dataGDAQ: datax, messages: "Gửi dữ liệu thành không công !"});
                }
                )}
                
                
            });
        }else{knex.select().table('tbdata').orderBy('id', 'desc').where({'check': true, 'isSent': false}).then((datax)=> //knex.select('*').from('users').havingIn('id', [5, 3, 10, 17])
        {
          res.render('dataSubmit', {dataGDAQ: datax, messages: "không có dữ liệu !"});
        }
        )}
    });
}
function deleteRecords(req, res){
    var id = (req.body.id).split(",");
    for (var i=0; i<id.length; i++)
    {
        id[i] = parseInt(id[i], 10);
    }
    knex('tbdata').whereIn('id', id).del().then((result)=>{
        res.redirect('/submitRecords');
    })
}
function tranferDataType(req, res){
knex('sendConfig').update({type: req.body.Type}).then((result)=>{
    res.redirect('/setting');

})
}

module.exports.controller = {submitdataByID, deleteRecords, tranferDataType};