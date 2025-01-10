const express = require('express');
const cors = require('cors');
const hotelController = require('./controllers/hotelsController');
const bookingController = require('./controllers/bookingController')
const errorHandler = require('./utils/errorHandler');

const app = express();

app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(cors({
    origin: 'https://localhost:3000', // Allow requests only from this domain
    methods: ['GET', 'POST'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'application/json'], // Specify allowed headers
    credentials: true, // If you want to send cookies or credentials
}));


app.use('/hotel', hotelController);
app.use('/booking', bookingController);


app.use(errorHandler);


app.get('/',(req,res)=>{
    console.log("Welcome to booking API!");
    res.send("Welcome to booking API!")
})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
