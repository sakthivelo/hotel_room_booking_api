
const mongoose = require('../config/db');

const hotelsSchema = new mongoose.Schema({  
    name : String,
    location : String,
    rooms : Number,
    availableRooms : Number,
    hotelId : String
})

const Hotels = new mongoose.model('hotels',hotelsSchema);

module.exports = Hotels;