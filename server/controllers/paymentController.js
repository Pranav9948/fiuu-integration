const axios = require("axios");
const crypto = require("crypto");

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
  const merchantID = process.env.MERCHANT_ID;
  const verifyKey = "6d001ebd1fdabb9c8e986dee8f01ec54";

  const dataToHash = amount + merchantID + orderID + verifyKey;

  const hash = crypto.createHash("md5").update(dataToHash).digest("hex");

  return hash;
}


// exports.handleIPN = async (req, res) => {
//   console.log("calling handle IPN");
//   try {
//     const postData = { ...req.body, treq: 1 };
//     const formData = new URLSearchParams(postData).toString();

//     console.log("formData", formData);

//     const ipnResponse = await axios.post(
//       "https://pay.fiuu.com/RMS/API/chkstat/returnipn.php",
//       formData,
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     console.log("IPN Responsse:", ipnResponse);

//     res.status(200).send("IPN Acknowledged");
//   } catch (error) {
//     console.error("error in handleIPN", error);
//     console.error("IPN Error:", error.message);
//     res.status(500).send("IPN Failed");
//   }
// };

// Notification & Callback Handler


exports.handleNotification = async (req, res) => {
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

  // Simulating the incoming POST request body
  const requestBody = {
    treq: 1,    
    tranID,
    orderid,
    status,
    domain,
    amount,
    currency,
    appcode,
    paydate,
    skey,
  };

  console.log("requestBody", requestBody);

  // Prepare POST data
  const postData = new URLSearchParams(requestBody).toString();

  const url = "https://pay.fiuu.com/RMS/API/chkstat/returnipn.php";

  // Function to send data to the API
  async function sendDataToAPI() {
    try {
      const response = await axios.post(url, postData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.status;
    } catch (error) {
      console.error("Error sending data to API:", error.message);
    }
  }

  const response = await sendDataToAPI();

  if (response === 200) {
    const secretKey = process.env.SECRET_KEY;

    console.log("secretKeynew", secretKey);
    const key0 = crypto
      .createHash("md5")
      .update(
        requestBody.tranID +
          requestBody.orderid +
          requestBody.status +
          requestBody.domain +
          requestBody.amount +
          requestBody.currency
      )
      .digest("hex");

    const key1 = crypto
      .createHash("md5")
      .update(
        requestBody.paydate +
          requestBody.domain +
          key0 +
          requestBody.appcode +
          secretKey
      )
      .digest("hex");

    console.log("key1", key1);
    console.log("skey", skey);
    console.log("key0", key0);

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
  } else {
    console.error("Failed to reach the payment verification server");
    return res.status(500).send("Server Error: Unable to verify transaction");
  }
};


exports.handleCallback = async (req, res) => {
  console.log("Callback Received:", req.body);

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
    nbcb,
  } = req.body;

  const secretKey = process.env.SECRET_KEY;

  // Validate the integrity of the data
  const key0 = crypto
    .createHash("md5")
    .update(
      tranID + orderid + status + domain + amount + currency
    )
    .digest("hex");

  const key1 = crypto
    .createHash("md5")
    .update(paydate + domain + key0 + appcode + secretKey)
    .digest("hex");

  if (skey !== key1) {
    console.error("Invalid transaction: Data integrity check failed");
    return res.status(400).send("Invalid Transaction");
  }

  if (status === "00") {
    console.log(`Callback Payment Success for Order ID: ${orderid}`);
    // Save success to DB or perform necessary actions here
    if (nbcb === "1") {
      console.log("Acknowledging callback IPN");
      return res.send("CBTOKEN:MPSTATOK"); // ACK response to gateway
    }
    return res.status(200).send("Callback Payment Successful");
  } else {
    console.error(`Callback Payment Failed for Order ID: ${orderid}`);
    return res.status(400).send("Callback Payment Failed");
  }
};


