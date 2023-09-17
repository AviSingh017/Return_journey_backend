const express = require('express');
const router = express.Router();
const { generateOTP, registerUser } = require('../controllers/userController');

router.post('/generateOTP', generateOTP);
router.post('/register', registerUser);

module.exports = {router};
