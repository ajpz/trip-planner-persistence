var express = require('express'),
    Router = express.Router(),
    Days = require('../../models/day');

//fix this
// Router.param('id', function(req, res, next, id) {
//     Days.find( { id} ).exec().
//     .then(function(days) {
//         req.days = days;
//     })
// })

Router.route('/days')
    // get all day documents
    .get(function(req, res, next) {
        Days.find({}).exec()
        .then(function(days) {
            res.status(200).json(days);
        })
        .then(null, next);
    })
    // create new empty day document based on day-number
    .post(function(req, res, next) {
        req.body.number = parseInt(req.body.number);
        console.log("req body", req.body);
        Days.create(req.body)
        .then(function(message) {
            console.log(message);
            res.send(message);
        })
        .then(null, next);
    });

Router.route('/days/doomswitch')
    .delete(function(req,res,next) {
        Days.remove({})
        .then(function success(response) {
            res.send(response);
        })
        .then(null, next);
    });

Router.route('/days/:id')
    // get a single day document
    .get(function(req, res, next) {
        Days.find({number: req.params.id}).exec()
            .then(function(day) {
                res.status(200).send(day);
            })
            .then(null, next);
    })
    .put(function(req, res, next) {
        var mapObject = {
            hotels: 'hotel',
            restaurants: 'restaurants',
            activities: 'activities'
        }
        // number: 1, hotel: _id,  restaurants: [_ids...], activities: [_ids...]
        Days.findOne( {number: req.params.id} ).exec()
            .then(function(day) {
                console.log(day);
                var sectionName = mapObject[req.body.sectionName];
                if( sectionName === 'hotel') {
                    day['hotel'] = req.body._id;
                } else {
                    day[sectionName].push(req.body._id);
                }
                return day.save()
            })
            .then(function(updatedDay) {
                res.status(200).send(updatedDay);
            })
            .then(null, next);
    })
    // delete a day document from db
    .delete(function(req, res, next) {
        Days.remove( { number: req.params.id } )
            .then(function(message) {
                console.log(message);
                res.status(200).send(message);
            })
            .then(null, next);
    })

Router.route('/days/:id/:sectionName')

    .put(function(req, res, next) {
        var mapObject = {
            hotels: 'hotel',
            restaurants: 'restaurants',
            activities: 'activities'
        }
        var sectionName = mapObject[req.params.sectionName]; 
        Days.findOne({number: req.params.id}).exec()
        .then(function(day) {
            if( sectionName === 'hotel') {
                delete day['hotel']; 
            } else {
                day = day[sectionName].filter(function(place, index) {
                    return place._id !== req.body;
                })
            }
            return day.save()
        })
        .then(function(day) {
            res.status(200).send(day); 
        })
        .then(null, next); 



    });


module.exports = Router;