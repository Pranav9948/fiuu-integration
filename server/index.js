const express = require('express');  
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routers/paymentRoutes');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Payment API Route
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
      