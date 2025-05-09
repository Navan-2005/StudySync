const User=require('../models/User')
const {getYoutubeVideos}=require('../services/getyoutubevideo');
const {googlesearch}=require('../services/googleschollers');

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

  const getvideos=async(req,res)=>{
    const {topic}=req.body;
    try {
      const videos=await getYoutubeVideos(topic);
      console.log('Response from youtube',videos);
      
      res.status(200).json(videos);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }

  const getScholars = async (req, res) => {
    const { topic } = req.body;
  
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
   console.log('topic : ',topic);
   
    try {
      const scholars = await googlesearch(topic);  // ✅ Correct function name
      console.log('Google Scholar results:', scholars);
  
      res.status(200).json({ scholars });
    } catch (error) {
      console.error('Error fetching scholar data:', error.message);
      res.status(500).json({ error: 'Failed to fetch scholar results' });
    }
  };
  
  

  module.exports={
    createUser,
    getUsers,
    loginuser,
    getprofile,
    getvideos,
    getScholars
  }