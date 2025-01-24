const axios = require("axios");

exports.initiatePayment = (req, res) => {
  const { amount, orderid, name, email, mobile } = req.body;

  if (!amount || !orderid || !name || !email || !mobile) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const vcode = generateSignature(amount, orderid);

  const paymentData = {
    merchant_id: process.env.MERCHANT_ID,
    amount,
    orderid,
    bill_name: name,
    bill_email: email,
    bill_mobile: mobile,
    bill_desc: "Purchase from Fiuu Demo App",
    vcode,
    currency: "MYR",
    returnurl: process.env.RETURN_URL,
    callbackurl: process.env.CALLBACK_URL,
    cancelurl: process.env.CANCEL_URL,
    langcode: "en",
  };

  console.log("paymentData", paymentData);

  res.status(200).json(paymentData);
};

function generateSignature(amount, orderID) {
  const crypto = require("crypto");

  const merchantID = process.env.MERCHANT_ID;
  const verifyKey = "6d001ebd1fdabb9c8e986dee8f01ec54";

  const dataToHash = amount + merchantID + orderID + verifyKey;

  const hash = crypto.createHash("md5").update(dataToHash).digest("hex");

  return hash;
}


exports.handleCallback = (req, res) => {
  console.log("reachedd");
  const { status, orderid } = req.body;
  console.log("req.boddd", req.body);
 
  res.redirect(
    `http://localhost:5173/payment-success?status=${status}&orderid=${orderid}`
  );
};

exports.handleIPN = async (req, res) => {
  console.log("calling handle IPN");
  try {
   
    const postData = { ...req.body, treq: 1 }; 
    const formData = new URLSearchParams(postData).toString();

    console.log("formData", formData);

   
    const ipnResponse = await axios.post(
      "https://pay.fiuu.com/RMS/API/chkstat/returnipn.php",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

  
    console.log("IPN Responsse:", ipnResponse);

  
    res.status(200).send("IPN Acknowledged");
  } catch (error) {
    console.error("error in handleIPN", error);
    console.error("IPN Error:", error.message);
    res.status(500).send("IPN Failed");
  }
};

// Notification & Callback Handler
exports.handleNotification = (req, res) => {
  console.log("Notification Received:", req.body);

  const {
    tranID,
    orderid,
    status,
    domain,
    amount,
    currency,
    appcode,
    paydate,
    skey,
  } = req.body;


  console.log("Payment Notification Received:", req.body);

  const secretKey = process.env.SECRET_KEY; 
  const key0 = crypto
    .createHash("md5")
    .update(`${tranID}${orderid}${status}${domain}${amount}${currency}`)
    .digest("hex");
  const key1 = crypto
    .createHash("md5")
    .update(`${paydate}${domain}${key0}${appcode}${secretKey}`)
    .digest("hex");

  if (skey !== key1) {
    console.error("Invalid transaction: Data integrity check failed");
    return res.status(400).send("Invalid Transaction");
  }


  if (status === "00") {
    console.log(`Payment Success for Order ID: ${orderid}`);

    return res.status(200).send("Payment Successful");
  } else {
    console.error(`Payment Failed for Order ID: ${orderid}`);
    return res.status(400).send("Payment Failed");
  }
};
