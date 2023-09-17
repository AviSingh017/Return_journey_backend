const express = require("express");
const app = express();

const cors = require('cors');

require("dotenv").config();

const {connection} = require("./config/db");
const {router} = require("./routes/userRoute");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/", router);

app.get("/", (req,res)=>{
    res.send("Hello from backend of SMSAPP");
});

app.listen(PORT, async()=>{
    try {
        await connection;
        console.log("Server connected with MongoDB");
    } catch (error) {
        console.log(error);
    }
    console.log(`Server is running on port ${process.env.port}`);
});