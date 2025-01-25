import cors from "cors";
import express from "express";
import router from "./routers/payment.router";   

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payments", router);

app.get("/api/getkey", (req, res) => {
  res.status(200).json({
    keyId: process.env.KEY_ID,
  });
});

export default app;
