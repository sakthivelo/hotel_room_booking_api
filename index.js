const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');


const app = express();

app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(cors({
    origin: 'https://localhost:3000', // Allow requests only from this domain
    methods: ['GET', 'POST'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'application/json'], // Specify allowed headers
    credentials: true, // If you want to send cookies or credentials
}));

//route to insert room booking
app.post('/bookroom',async (req,res)=>{
    const roomDetails = req.body;
    try{
        await db.connection.collection('roombooking').insertOne(roomDetails);

        await updateAvailableRooms(roomDetails.hotelId, roomDetails.numberOfRooms, 'update');

        res.send({error:"", msg:"Success"})
    } catch(e){
        console.log("error in inserting", e)
        res.send({error:"Error in room Booking!", msg:"Failiure"})
    }
    
})

async function  updateAvailableRooms(hotelId, noOfRooms, action) {
    const hotelObj = await db.connection.collection('hotels').findOne({_id: new ObjectId(hotelId)});
    console.log("hotelObj",hotelObj, action)
    let rooms = 0;
    if(action == 'update') {
        rooms  = hotelObj.availableRooms - parseInt(noOfRooms);
    }else {
        rooms  = hotelObj.availableRooms + parseInt(noOfRooms);
    }
        
    const obj = {
        availableRooms : rooms
    }
    db.connection.collection('hotels').updateOne({
        _id: new ObjectId(hotelId)
    },
    {$set: obj});

}

//route to get all hotels
app.get('/hotels', async (req,res)=>{
    const hotels = await db.connection.collection('hotels').find({}).toArray();
   
    if(hotels.length > 0) {
        res.send({hotels:hotels});
    } else {
        res.send({error:"No records found!"});
    }
    
})
//route to get hotel details
app.get('/fetchHotelDetails', async (req,res)=>{    
    const hotelId = req.query.hotelId;
    const hotels = await db.connection.collection('hotels').findOne({ _id: new ObjectId(hotelId)});
    if(hotels) {
        res.send({hotels:hotels});
    } else { 
        res.send({error:"No records found!"});
    }
    
})
//route to get room booking details
app.get('/fetchBookingDetails', async (req,res)=>{    
    const bookingId = req.query.id;
    const bookingDetails = await db.connection.collection('roombooking').findOne({ _id: new ObjectId(bookingId)});
    if(bookingDetails) {
        res.send({bookingDetails:bookingDetails});
    } else { 
        res.send({error:"No records found!"});
    }
    
})

//route  to get all bookings
app.get('/mybookings', async (req,res)=>{    
    const user = req.query.user;
    const rooms = await db.connection.collection('roombooking').find({userId:user}).toArray();
    
    if(rooms) {
        res.send({rooms:rooms});
    } else { 
        res.send({error:"No records found!"});
    }
    
})

//route to update booking detials
app.put('/updatebooking',async (req,res)=>{
    console.log("request",req.body);
    const roomDetails = req.body;
    const bookingId = roomDetails.id;
    try{
        const bookingDetails = await getRoomBookingDetails(bookingId);
        const oldBookedRooms = parseInt(bookingDetails.numberOfRooms);
        await db.connection.collection('roombooking').updateOne(
            { _id: new ObjectId(bookingId) },  // Convert id to ObjectId
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
        console.log("error in inserting", e)
        res.send({error:"Error in room Booking!", msg:"Failiure"})
    }

    
})

async function getRoomBookingDetails(bookingId){
    const bookingDetials = await db.connection.collection('roombooking').findOne({_id: new  ObjectId(bookingId)})
    return bookingDetials;
}

//route to cancel booking
app.put('/cancelbooking',async (req,res)=>{
    const roomDetails = req.body;
    const bookingId = roomDetails.id;
    try{
        await db.connection.collection('roombooking').updateOne(
            { _id: new ObjectId(bookingId) },  // Convert id to ObjectId
        { $set: roomDetails.roomDetails } );
        const bookingDetials = await getRoomBookingDetails(bookingId);
        console.log("bookingDetials",bookingDetials)
        //const bookingDetials = await db.connection.collection('roombooking').findOne({_id: new  ObjectId(bookingId)})
        const hotelId = bookingDetials.hotelId;
        const noOfRooms = bookingDetials.numberOfRooms;
        await updateAvailableRooms(hotelId,noOfRooms, 'cancel');

        res.send({error:"", msg:"Success"})
    } catch(e){
        console.log("error in inserting", e)
        res.send({error:"Error in room Booking!", msg:"Failiure"})
    }    
})

app.get('/',(req,res)=>{
    console.log("Welcome to booking API!");
    res.send("Welcome to booking API!")
})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
