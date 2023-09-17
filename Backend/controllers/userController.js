const bcrypt = require("bcrypt");
const twilio = require("twilio");
const {UserModel} = require("../models/userModel");
const ipinfo = require("ipinfo");
require("dotenv").config();

const client = twilio(process.env.twilio_Accountsid, process.env.twilio_Auth_Token);

 {/* Instead of Using Db using temp map for storing the OTP etc */}
const otpMap = new Map();

const generateOTP = async (req, res) => {
    const {phoneNumber} = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000);

    {/* Adding OTP Expiry like real world applications*/}
    const otpExpirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minute expiry
    otpMap.set(phoneNumber, { otp, expirationTime: otpExpirationTime });

    {/* Twilio sending OTP
        but it will only verify my number which I added in twilio */}
    client.messages.create({
        body: `Your OTP for registration is: ${otp}`,
        from: process.env.twilio_Phone_Number,
        to: phoneNumber
    })
        .then(() => {
            res.status(200).send({ "Status":"Success", "msg":'OTP sent successfully'});
        })
        .catch(error => {
            res.status(500).send({"Status":"Error", "msg":'Error sending OTP', "Error":error});
        });
};

const registerUser = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    const storedOTPInfo = otpMap.get(phoneNumber);

    if (!storedOTPInfo || storedOTPInfo.otp !== parseInt(otp, 10)) {
        return res.status(400).send({ "Status":"Error", "Error": "Invalid OTP"});
    }

    if (storedOTPInfo.expirationTime < new Date()) {
        return res.status(404).send({ "Status": "Error", "Error": "OTP has expired, request a new one"});
    }

    const userIpAddress = req.ip;

    ipinfo(userIpAddress, async (error, details) => {
        if (error) {
            console.log({'Error':error});
            return res.status(400).send({"Status":"Error", "Error":"Error validating IP address"});
        }

        {/* just for testing as I am testing apis using thunderclient*/}
        if (details.country == 'US') {
            return res.status(400).send({"Status":"Success", "Error":"User IP address is not allowed"});
        }

        const hashedPhoneNumber = bcrypt.hashSync(phoneNumber, 7);

        const newUser = new UserModel({
            phoneNumber: hashedPhoneNumber,
            ipAddress: userIpAddress
        });

        await newUser.save();
        res.status(200).send({"Status":"Success", "msg":"User registered successfully"});
    });
};

module.exports = {generateOTP, registerUser};
