'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function(req,res) {

        //Get id topic from url
        var topicId = req.params.topicId

        //Find by id topic
        Topic.findById(topicId).exec((err,topic)=>{

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message:"Request not valid"
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message:"Topic not found"
                });
            }

            //Check if user is auth and validate comment
            if (req.body.content) {
                //Validate data
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (error) {
                    return res.status(200).send({
                        message:'No comment yet'
                    });
                }

                if (validate_content) {
                    var comment ={
                        user:req.user.sub,
                        content: req.body.content,
                    };
                    //add comment into topic (property comments)
                    topic.comments.push(comment);

                    //Save topic
                    topic.save((err)=>{
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message:"Request not valid"
                            });
                        }

                        Topic.findById(topic._id)
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

                                //Return response
                                return res.status(200).send({
                                    status:'success',
                                    topic
                                });
                            });

                    })

                }else{
                    return res.status(200).send({
                        message:'comment not valid'
                    });
                }
            }

        });

    },
    update: function(req,res) {
        //get id comment 
        var commentId = req.params.commentId;

        //get data and validate
        var params = req.body;

        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                message:'No comment yet'
            });
        }

        if (validate_content) {
             //find and update (subdocument)
             Topic.findOneAndUpdate(
                 {"comments._id":commentId},
                 {
                     "$set":{
                         "comments.$.content":params.content
                     }
                 },
                 {new:true},
                 (err,topicUpdated) => {

                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message:"Request not valid"
                        });
                    }

                    if (!topicUpdated) {
                        return res.status(500).send({
                            status: 'error',
                            message:"Topic not founded"
                        });
                    }

                    //return response
                    return res.status(200).send({
                        status:'success',
                        topic: topicUpdated
                    });
                 }
             )

        }

    },
    delete: function(req,res) {

        //Get id topic and comment from url
        var topicId = req.params.topicId
        var commentId = req.params.commentId;

        //Search topic
        Topic.findById(topicId,(err,topic)=>{

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message:"Request not valid"
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message:"Topic not founded"
                });
            }
            //Select subdocument (Comment)
            var comment = topic.comments.id(commentId);

            //Delete comment
            if (comment) {
                comment.remove();

                //Save topic
                topic.save((err)=>{

                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message:"Request not valid"
                        });
                    }

                    Topic.findById(topic._id)
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

                                //Return response
                                return res.status(200).send({
                                    status:'success',
                                    topic
                                });
                            });
                });
            
            }else{
                return res.status(404).send({
                    status: 'error',
                    message:"Comment not exists"
                });
            }
            
        });
    }
}

module.exports = controller;