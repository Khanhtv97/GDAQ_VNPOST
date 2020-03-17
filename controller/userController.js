const knex = require('knex')(require('../model/connection'));
const bcrypt = require('bcrypt');
const users = []
async function changepassword(req, res){
    knex.select().table('users').where('id', req.body.id).then((data)=>
    {
      data.map(function(row){
        bcrypt.compare(req.body.oldpass,row.password, async(err, result)=>{
          if(result) {
            try{
              const hashNewPassword = await bcrypt.hash(req.body.newpass, 10);
              knex('users').where({'id': req.body.id}).update({
                password: hashNewPassword,
               }).then((data)=>{
                res.render('login')
              })
            }catch{
            }
          } else {
            res.send("Thay doi mat khau khong thanh cong");
           // Passwords don't match
          } 
        });
      })
    })}
function deleteUser(req, res, next){
  knex('users').where('id',req.body.id).del().then((result)=>{
      res.redirect('/users');
  })
  .catch(err => next(err));
}
async function update(req, res){
    try{
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      knex('users').where('id', req.body.id).update({
        name: req.body.name,
        username: req.body.username,
        password: hashPassword,
        role: req.body.role}).then((err)=>{
            res.redirect('/users');
      })
      .catch(err => next(err));
    }catch{
      res.redirect('/users');
    }
  }
  async function register(req, res){
    try{
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        username: req.body.username,
        password: hashPassword,
        role: req.body.role
      });
      res.redirect('/users');
    }catch{
      res.redirect('/users');

    }
    knex('users').insert(users).then((data)=>{
      console.log("success to create Users")
    })
  }
module.exports.Controller = {changepassword, deleteUser, update, register}