'use strict'

var validator = require('validator'); //import validator
var bcrypt = require('bcrypt-nodejs'); //import encryp
var User = require('../models/user'); //Import model
var jwt = require('../services/jwt'); //Import service to generate token
var fs = require('fs');
var path = require('path');
const { param } = require('../routes/user');

var controller = {

    test: function(req, res){
        return res.status(200).send({
            message: "perro testing 1"
        });
    },
    test2: function(req, res){
        return res.status(200).send({
            message: "perro testing 2"
        });
    },
    save: function(req,res){
        //Get params from request
        var params = req.body;

        //Validate data
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message:'Missing data to send'
            });
        }

        //console.log(validate_name,validate_surname,validate_email,validate_password);
        if (validate_name && validate_surname && validate_email && validate_password) {
            //Create user object
            var user = new User();

            //Set values to object
            user.name = params.name; 
            user.surname = params.surname; 
            user.email = params.email.toLowerCase(); 
            user.role = 'ROLE_USER'; 
            user.image = null; 

            //check if user already exists
            User.findOne({email:user.email},(err,issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message:'Fail register user'
                    });
                }

                if(!issetUser){
                     //user not exists: cypher password
                     
                    bcrypt.hash(params.password,null,null,(err,hash)=>{
                        user.password = hash;
                        //console.log(user.password);

                        //Save user
                        user.save((err,userStored)=>{
                            if (err) {
                                return res.status(500).send({
                                    message:'User already exists'
                                });
                            }

                            if(!userStored){
                                return res.status(400).send({
                                    message:'User already exists'
                                });
                            }

                            return res.status(200).send({
                                status:'success',
                                user:userStored});
                        }); //close save
                    });//close bcrypt
                    
                }else{
                    return res.status(200).send({
                        message:'User already exists'
                    });
                }
            });

           
        }else{
            return res.status(200).send({
                message:'Error'
            });
        }
    },
    login: function(req,res){
        //Recojer parametros de peticion
        var params = req.body;

        //Validar informacion
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(200).send({
                message:'Missing data to send'
            });
        }

        if (!validate_email || !validate_password) {
            return res.status(200).send({
                message:'Email or password incorrect!'
            });
        }

        //Buscar usuarios que coincida con el email
        User.findOne({email: params.email.toLowerCase()},(err,user)=>{

            //Si se produce un error
            if (err) {
                return res.status(500).send({
                    message:'Error 500'
                });   
            }

            //Si no encuentra al usuario
            if (!user) {
                return res.status(404).send({
                    message:'User do not exists'
                });   
            }

            //Si lo encuentra(el email) comprobar la contraseña (Coincidencia de email y password)
            bcrypt.compare(params.password, user.password, (err,check)=>{
                //Si es correcta devolver los datos
                if(check){
                    //Generar token de jwt y devolverlo
                    if (params.gettoken) {
                        //Devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });   
                    }else{
                        //Limpiar objeto, evitar devolver campos que no queremos enviar
                        user.password = undefined;

                        //Devolver los datos
                        return res.status(200).send({
                            message:'success',
                            user
                    });   
                    }                    

                }else{

                    return res.status(200).send({
                        message:'Email or password incorrect!'
                    });   
                }
            });
        });
    },
    update: function(req,res){

        //Recuperar datos del usuario
        var params = req.body;

        //Validate data
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message:'Missing data to send'
            });
        }

        //Eliminar propiedades 
        delete params.password;

        var userId = req.user.sub;
        //console.log("email db:"+req.user.email);
        //console.log("email param"+params.email);

        //Comprobar si el email es unico
        if (req.user.email != params.email.toLowerCase()) {

            User.findOne({email:params.email.toLowerCase()},(err,user) => {

                if (err) {
                    return res.status(500).send({
                        message:'Fail register user'
                    });
                }

                if (user && user.email == params.email.toLowerCase() ) {
                    return res.status(200).send({
                        message:'You can not modify email'
                    });
                }else{
                    //Buscar y actualizar documento de la base de datos
                    User.findOneAndUpdate({_id:userId},params,{new:true},(err,userUpdated) => {
                        
                        //Si sale un error
                        if (err) {
                            return res.status(500).send({
                                status:'error',
                                message:'Update error'
                            });
                        }

                        if (!userUpdated) {
                            return res.status(200).send({
                                status:'error',
                                message:'Update error'
                            });
                        }
                        
                        //Devolver respuesta
                        return res.status(200).send({
                            status:'success',
                            user:userUpdated
                        });
                    });
                }

            });
        }else if(req.user.email.toLowerCase() == params.email.toLowerCase()){
            //Buscar y actualizar documento de la base de datos
            User.findOneAndUpdate({_id:userId},params,{new:true},(err,userUpdated) => {
                
                //Si sale un error
                if (err) {
                    return res.status(500).send({
                        status:'error',
                        message:'Update error'
                    });
                }

                if (!userUpdated) {
                    return res.status(200).send({
                        status:'error',
                        message:'Update error'
                    });
                }
                
                //Devolver respuesta
                return res.status(200).send({
                    status:'success',
                    user:userUpdated
                });
            });
        }
    },
    uploadAvatar: function(req,res){
        //Configurar modulo multiparty, hecho en routes/user.js

        //Recojer fichero de la peticion
        var file_name = 'Avatar not uploaded';

        //console.log(req.files);
        //Si no existe el archivo entonces mostrar mensaje de fallo
        if (!req.files) {
            return res.status(404).send({
                status:'error',
                message:file_name
            });
        }

        //Conseguir nombre y extension
        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');

        //Advertencia****** en linux o mac es / y en windows \\

        //Nombre del archivo
        var file_name = file_split[2];

        //Extension del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        //Comprobar extension solo imagenes, si no es valida borrar fichero subido

        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path,(err)=>{
                return res.status(200).send({
                    status:'error',
                    message:'File extension not valid'
                });
            })
        }else{
            //Comprobar usuario identificado, sacar id del usuario identificado
            var userId = req.user.sub;

            //buscar y actualizar documento de bd
            User.findOneAndUpdate({_id:userId},{image:file_name},{new:true},(err,userUpdated)=>{

                if (err || !userUpdated) {
                    return res.status(500).send({
                        status:'error',
                        message:'Upload image failed'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status:'success',
                    user:userUpdated
                });
            });
        }
    },
    avatar: function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile,(exists)=>{
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    message:'The image doesnt exist'
                });
            }
        });
    },
    getusers: function(req,res){
        User.find().exec((err,users)=>{
            if (err || !users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No users founded'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },
    getuser: function(req,res){
        var userId = req.params.userId;

        User.findById(userId).exec((err,user)=>{
            if (err || !user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No user founded'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }
};

module.exports = controller;