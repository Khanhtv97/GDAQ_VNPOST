const knex = require('knex')(require('../model/connection'));

module.exports ={
    getAll,
    create,
    update,
    delete: _delete
};
async function getAll(){
    knex.select().table('users').then((data)=>{
        return data
    })

}