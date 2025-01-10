const router = require('express').Router();
const Booking = require('../models/booking');
const Hotels = require('../models/hotels');


//route to insert room booking
router.post('/bookroom',async (req,res)=>{
    const {numberOfRooms,
        checkInDate,
        checkOutDate,
        hotelId,
        userId,
        status} = req.body;
    try{
        //await db.connection.collection('roombooking').insertOne(roomDetails);
        const booking = new Booking(
            {
                numberOfRooms : numberOfRooms,
                checkInDate : checkInDate,
                checkOutDate: checkOutDate,
                hotelId : hotelId,
                userId : userId,
                status : status
            }
        )
        await booking.save(booking);
        await updateAvailableRooms(hotelId, numberOfRooms, 'update');

        res.send({error:"", msg:"Success"})
    } catch(e){
        res.send({error:"Error in room Booking!", msg:"Failiure"})
    }
    
})



//route to get room booking details
router.get('/fetchBookingDetails', async (req,res)=>{    
    const bookingId = req.query.id;
    try{
        const bookingDetails = await Booking.findOne({_id:bookingId})
        if(bookingDetails) {
           
            const hotelDetails = await Hotels.findOne({_id:bookingDetails.hotelId})
            
            res.send({bookingDetails:bookingDetails,hotelDetials:hotelDetails});
        } else { 
            res.send({error:"No records found!"});
        }   
    } catch(e){
        res.send({error:e.error});
    }

})

//route  to get all bookings
router.get('/mybookings', async (req,res)=>{    
    const user = req.query.user;
    const rooms = await Booking.find({userId:user})
    if(rooms) {
        res.send({rooms:rooms});
    } else { 
        res.send({error:"No records found!"});
    }
    
})



//route to update booking detials
router.put('/updatebooking',async (req,res)=>{
    const roomDetails = req.body;
    const bookingId = roomDetails.id;
    try{
        const bookingDetails = await getRoomBookingDetails(bookingId);
        const oldBookedRooms = parseInt(bookingDetails.numberOfRooms);
        
        await Booking.updateOne(
            { _id: bookingId},  // Convert id to ObjectId
        { $set: roomDetails.roomDetails } );

        const roomBookingDetails = await getRoomBookingDetails(bookingId);
        const hotelId = roomBookingDetails.hotelId;
        let noOfRooms = roomBookingDetails.numberOfRooms;      
        const newRooms = parseInt(roomDetails.roomDetails.numberOfRooms);
        if(oldBookedRooms > newRooms){
            noOfRooms = oldBookedRooms - newRooms;
            await updateAvailableRooms(hotelId,noOfRooms, 'cancel');
        } else if(oldBookedRooms < newRooms){
            noOfRooms = newRooms - oldBookedRooms;
            await updateAvailableRooms(hotelId,noOfRooms, 'update');
        }
        
        res.send({error:"", msg:"Success"})
    } catch(e){
        res.send({error:"Error in room Booking!", msg:"Failiure"})
    }

    
})

async function getRoomBookingDetails(bookingId){
    //const bookingDetials = await db.connection.collection('roombooking').findOne({_id: new  ObjectId(bookingId)})
    const bookingDetials = await Booking.findOne({_id:bookingId})
    return bookingDetials;
}

//route to cancel booking
router.put('/cancelbooking',async (req,res)=>{
    const roomDetails = req.body;
    const bookingId = roomDetails.id;
    try{
        await Booking.updateOne(
            { _id: bookingId },  // Convert id to ObjectId
        { $set: roomDetails.roomDetails } );
        const bookingDetials = await getRoomBookingDetails(bookingId);
        const hotelId = bookingDetials.hotelId;
        const noOfRooms = bookingDetials.numberOfRooms;
        await updateAvailableRooms(hotelId,noOfRooms, 'cancel');

        res.send({error:"", msg:"Success"})
    } catch(e){
        res.send({error:"Error in room Booking!", msg:"Failiure"})
    }    
})

async function  updateAvailableRooms(hotelId, noOfRooms, action) {
    const hotelObj = await Hotels.findOne({_id:hotelId});
    let rooms = 0;
    if(action == 'update') {
        rooms  = hotelObj.availableRooms - parseInt(noOfRooms);
    }else {
        rooms  = hotelObj.availableRooms + parseInt(noOfRooms);
    }
        
    const obj = {
        availableRooms : rooms
    }
    await Hotels.updateOne({
        _id: hotelId
    },
    {$set: obj});

}


module.exports = router;