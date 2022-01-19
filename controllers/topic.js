'use strict'

var validator = require('validator');
const topic = require('../models/topic');
var Topic = require('../models/topic');

var controller = {
    test: function(req,res){
        return res.status(200).send({
            message:'test topic controller'
        });
    },
    save:function(req,res){
        //Get data from post request
        var params = req.body;

        //Validate data
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({
                message:'Missing data to sent'
            });
        }

        if (validate_title && validate_content && validate_lang) {
            //create object
            var topic = new Topic();

            //set properties
            topic.title=params.title;
            topic.content=params.content;
            topic.code=params.code;
            topic.lang=params.lang;
            topic.user = req.user.sub;

            //save topic
            topic.save((err,topicStored)=>{

                if (err || !topicStored) {
                    //Return response
                    return res.status(404).send({
                        status:'error',
                        message:'Topic not found'
                    });  
                }

                //Return response
                return res.status(200).send({
                    status:'success',
                    topic:topicStored
                });   
            });

        }else{
            return res.status(200).send({
                message:'Data not valid'
            });   
        }        
    },
    getTopics: function(req,res){

        //Load library pagination (In model class)
        
        //Get current page
        if (!req.params.page || req.params.page == 0 || req.params.page == '0' || req.params.page == null || req.params.page == undefined) {
            var page = 1;
        }
        else{
            var page = parseInt(req.params.page);
        }
        
        //Set options pagination
        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page: page
        }

        //Find paginator
        Topic.paginate({},options,(err,topics)=>{
            //Return result (topics, total topics, total pages)

            if (err) {
                return res.status(500).send({
                    status:'error',
                    message: 'Topics errors',
                }); 
            }

            if (!topics) {
                return res.status(404).send({
                    status:'error',
                    message: 'Topics not founds',
                }); 
            }
            //Return response
            return res.status(200).send({
                status:'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            }); 
        })
    },
    getTopicsByUser: function(req,res){

        //Conseguir el ide del usuario
        var userId = req.params.user

        //console.log(userId);

        //Find con la condicion de usuario
        Topic.find({
            user: userId
        })
        .sort([['date','descending']])
        .exec((err,topics)=>{
            if (err) {
                //Devolver el resultado
                return res.status(500).send({
                    status: 'error',
                    message: 'Error'
                });
            }

            if (!topics) {
                //Devolver el resultado
                return res.status(404).send({
                    status: 'error',
                    message: 'topics not found'
                });
            }

            //Devolver el resultado
            return res.status(200).send({
                status: 'success',
                topics
            });

        });
    },
    getTopic: function(req,res){

        //Sacar el id del topic request
        var topicid = req.params.id;

        //Find id del topic
        Topic.findById(topicid)
        .populate('user')
        .populate('comments.user')
        .exec((err,topic)=>{
            if (err) {
                return res.status(500).send({
                    status:'error',
                    message:'error' 
                 });
            }

            if (!topic) {
                return res.status(404).send({
                    status:'error',
                    message:'Topic not found' 
                 });
            }

            return res.status(200).send({
                status:'success',
                topic 
             });
        });
    },
    update: function(req,res){
        //get id topic from url
        var topicID = req.params.id;

        //get data from post
        var params = req.body;

        //Validate data
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({
                message:'Missing data to sent'
            });
        }

        if (validate_title && validate_content && validate_lang) {
                    //create json with data update
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            //find and update topic and id user(own)
            Topic.findOneAndUpdate({_id:topicID, user:req.user.sub},update,{new:true},(err,topicUpdated)=>{

                if (err) {
                    return res.status(500).send({
                        status:'error',
                        message:'fail request'
                    });
                }

                if (!topicUpdated) {
                    return res.status(404).send({
                        status:'error',
                        message:'Topic not founded'
                    });
                }

                //Return response
                return res.status(200).send({
                    status:'success',
                    topic:topicUpdated
                });
            });

        }else{
            //Return response
            return res.status(200).send({
                message: 'Invalid data'
            });
        }
    },
    delete: function(req,res){

        //Get id topic
        var topicId = req.params.id;

        //Find and delete byr topicID and by userID
        Topic.findOneAndDelete({_id:topicId,user:req.user.sub},(err,topicRemoved)=>{
            if (err) {
                return res.status(500).send({
                    status:'error',
                    message:'fail request'
                });
            }

            if (!topicRemoved) {
                return res.status(404).send({
                    status:'error',
                    message:'Topic not founded'
                });
            }

            //Return response
            return res.status(200).send({
                status:'success',
                topic:topicRemoved
            });
        });
    },
    search: function (req,res){

        //Get string from url
        var searchString = req.params.search;

        //Find with or operator
        Topic.find({"$or":[
            {"title":{"$regex":searchString,"$options":"i"}},
            {"content":{"$regex":searchString,"$options":"i"}},
            {"code":{"$regex":searchString,"$options":"i"}},
            {"lang":{"$regex":searchString,"$options":"i"}},
        ]})
        .populate('user')
        .sort([['date','descending']])
        .exec((err,topics)=>{

            if (err) {
                return res.status(500).send({
                    status:'error',
                    message:'Request error'
                });
            }

            if (!topics) {
                return res.status(500).send({
                    status:'error',
                    message:'Not topics founded'
                });
            }
            //Return response
            return res.status(200).send({
                status:'success',
                topics
            });
        });
    }
};

module.exports = controller;