const express = require('express');
const { initiatePayment,handleCallback,handleIPN,handleNotification} = require('../controllers/paymentController');
const router = express.Router();


// Route to initiate payment
router.post('/initiate', initiatePayment);


router.post('/notification', handleNotification);

router.post('/callback', handleCallback);  
// Callback handler




module.exports = router;
