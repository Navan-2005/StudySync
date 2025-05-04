const User=require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.authUser=async (req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
      console.log('token not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      console.log('token : ',token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = user;
      console.log('decoded : ',decoded);
      
      return next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Unauthorized' });
    }
}