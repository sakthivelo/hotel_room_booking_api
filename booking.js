const mongoose = require('../config/db');

const bookingSchema = new mongoose.Schema({    
    numberOfRooms : String,
    checkInDate : String,
    checkOutDate : String,
    hotelId : String,
    userId : String,
    status : String
})

const RoomBooking = new mongoose.model('roombooking',bookingSchema);

module.exports = RoomBooking;