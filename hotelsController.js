const router = require('express').Router();
const Hotels = require('../models/hotels');

//route to get all hotels
router.get('/hotels', async (req,res)=>{
    const location = req.query.location? req.query.location :'';
    let obj = {};
    if(location){
        obj = {
            location:location
        }
    }
    const hotels = await Hotels.find(obj).sort({_id:-1});
    if(hotels.length > 0) {
        res.send({hotels:hotels});
    } else {
        res.send({error:"No records found!"});
    }
    
})

//route to get hotel details
router.get('/fetchHotelDetails', async (req,res)=>{    
    const hotelId = req.query.hotelId;
    const hotels = await Hotels.findOne({_id:hotelId});
    if(hotels) {
        res.send({hotelDetials:hotels});
    } else { 
        res.send({error:"No records found!"});
    }
    
})


module.exports = router;