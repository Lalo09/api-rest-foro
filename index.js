'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port =  process.env.PORT || 3999;

mongoose.Promise = global.Promise;
//Conection to database
mongoose.connect('mongodb://localhost:27017/api_rest_node',{useNewUrlParser: true})
    .then(()=>{
        console.log('Succesful conection');

        //Create server
        app.listen(port,()=>{
            console.log('Server running http://localhost:3999/')
        });
    })
    .catch(error => console.log(error));