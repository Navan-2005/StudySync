// routes/userRoutes.js
const express = require('express');
const { createUser, getUsers,loginuser,getprofile,getvideos } = require('../controllers/usercontroller');
const router = express.Router();
const authmiddleware=require('../middlewares/authmiddleware')

router.post('/signup', createUser);  // Route to create a new user
router.get('/getuser', getUsers); 
router.post('/profile',authmiddleware.authUser,getprofile)    // Route to get all users
router.post('/login',loginuser)
router.post('/video',getvideos)

module.exports = router;
