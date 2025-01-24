const express = require('express');
const { initiatePayment, handleCallback ,handleIPN,handleNotification} = require('../controllers/paymentController');
const router = express.Router();

// Route to initiate payment
router.post('/initiate', initiatePayment);

router.post('/ipn', handleIPN);

router.post('/notification', handleNotification);






// Callback handler
// router.post('/callback', handleCallback);

module.exports = router;
