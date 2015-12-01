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
    // POST to /days creates or finds a day with the provided "number"
    // assumes req.body only has number property
    .post(function(req, res, next) {
        Days.findOrCreate( { number: parseInt(req.body.number) } )
        .then(function(day) {
            res.status(200).send(day); 
        })
        .then(null, next); 
    });

Router.route('/days/doomswitch')
    // DELETE everything from the 'Days' collection
    .delete(function(req,res,next) {
        Days.remove({})
        .then(function success(response) {
            res.send(response);
        })
        .then(null, next);
    });

Router.route('/days/:number')
    // GETs a single days data
    .get(function(req, res, next) {
       Days.find({number: req.params.number}).exec()
            .then(function(day) {
                res.status(200).send(day);
            })
            .then(null, next); 
    })
    .delete(function(req, res, next) {
        Days.remove( { number: req.params.number } )
            .then(function(message) {
                console.log(message);
                res.status(200).send(message);
            })
            .then(null, next);
    })

Router.route('/days/:number/:placeType')
    .put(function(req, res, next) {
        // get a single day document
        var number = req.params.number, 
            placeType = req.params.placeType,
            place_id = req.body._id;  

        Days.findOrCreate( { number: number } )
            .then(function(day) {
                if(placeType === 'hotels') {
                    day['hotel'] = place_id; 
                } else {
                    day[placeType].push(place_id); 
                }
                return day.save(); 
            })
            .then(function(day) {
                res.status(200).send(day); 
            })
            .then(null, next); 
    })
    .delete(function(req, res, next) {
        // deletes a single place from a day document
        var number = req.params.number, 
            placeType = req.params.placeType,
            place_id = req.body._id; //check this  

        console.log('Params (number, placeType, place_id):', number, placeType, place_id); 
        Days.findOne( { number : number } ).exec()
        .then(function(day) {
            if( placeType === 'hotels') {
                if(day.hotel.toString() === place_id) {
                    day.hotel = null; 
                    // delete day.hotel;  
                }
            } else {
                day[placeType] = day[placeType].filter(function(_id) {
                    return _id.toString() !== place_id;
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