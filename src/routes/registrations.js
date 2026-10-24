const express = require('express');
const router = express.Router();
const regController = require('../controllers/registrationController');

router.post('/', regController.registerUser);
router.post('/cancel', regController.cancelRegistration);

module.exports = router;