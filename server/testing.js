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

  const secretKey = process.env.SECRET_KEY;


  console.log('secretKey', secretKey);

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

        console.log("key0", key0);


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
              console.log('skey',requestBody.skey)