var express = require('express'),
    Router = express.Router(),
    Days = require('../../models/day');

Router.route('/days')
    .post(function(req, res, next) {
        console.log("req body", req.body);
        Days.create({
            number: req.body.number
        })
        .then(function(message) {
            console.log(message);
            res.send(message);
        })
        .then(null, next);
    });

Router.route('/days/:id')
    .get(function(req, res, next) {
        Days.find({number: req.params.id}).exec()
            .then(function(day) {
                res.status(200).send(day);
            })
            .then(null, next);
    });

Router.route('/days/:id/hotels')
    .get(function(req, res, next) {});

Router.route('/days/:id/restaurants')
    .get(function(req, res, next) {});

Router.route('/days/:id/activities')
    .get(function(req, res, next) {});


module.exports = Router;