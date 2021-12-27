const express = require('express');
const router = express.Router();

const auth = require('.auth')

//@route    GET api/profile/me
//@desc     Get current user's profile
//@access   Private
router.get('/', auth (req, res) => res.send('Profile route'));

module.exports = router;
