const crypto = require("crypto");

const requestBody= {
    treq: 1,
    tranID: '30936402',
    orderid: 'DEMO5161',
    status: '00',
    domain: 'SB_lerentravel',
    amount: '1.15',
    currency: 'MYR',
    appcode: '123456',
    paydate: '2025-01-25 11:13:18',
    skey: '6d91926766c81ae94c94c0160bb0df51'
  }

  const {tranID,treq,orderid,status,domain,amount,currency,appcode,paydate,skey,}=requestBody

  const secretKey = '0e2c7e1feb59c4fd616d9d5cd9ebdbba'

  const key0PlainText = 
  requestBody.tranID +
  requestBody.orderid +
  requestBody.status +
  requestBody.domain +
  requestBody.amount +
  requestBody.currency;

console.log("key0 Plain Text:", key0PlainText);

const key0 = crypto
  .createHash("md5")
  .update(key0PlainText)
  .digest("hex");
  
console.log("key0 Hash:", key0);

const key1PlainText = 
  requestBody.paydate +
  requestBody.domain +
  key0 +
  requestBody.appcode +
  secretKey;

console.log("key1 Plain Text:", key1PlainText);    

const key1 = crypto
  .createHash("md5")
  .update(key1PlainText)
  .digest("hex");

console.log("key1 Hash:", key1);
console.log("skey Received:", skey);
  