var mongoose = require('mongoose');
// PlaceSchema = require('./place').schema,
// ActivitySchema = require('./activity').schema,
// RestaurantSchema = require('./restaurant').schema,
// HotelSchema = require('./hotel').schema;

var DaySchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    hotel: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Hotel"
    },
    restaurants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Restaurant"
    },
    activities: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Activity"
    }
});

module.exports = mongoose.model('Day', DaySchema);
