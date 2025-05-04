const User=require('../models/User')

const createUser = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await User.hashPassword(password);
      const existinguser=await User.findOne({email});
      if(existinguser){
        console.log('User already exists');
        return res.status(409).json({ error: 'User already exists' });
      }
      const user = new User({ username, email,password:hashedPassword });
      await user.save();
      const token=user.generateAuthToken();
      
      res.status(201).json({user,token});
    } catch (error) {
      console.log('In catch block');
      
      res.status(400).json({ error: error.message });
    }
  };
  
  const getUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  const loginuser=async(req,res)=>{
    try {
      const { email, password } = req.body;
      const user= await User.findOne({email});
      if(!user){
        res.status(404).json({error:"user not found"});
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = user.generateAuthToken();
      res.cookie('token', token);
      console.log('token : ',token);
      
      res.status(200).json({token,user});
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
  const getprofile=async(req,res)=>{res.send(req.user);};

  module.exports={
    createUser,
    getUsers,
    loginuser,
    getprofile
  }