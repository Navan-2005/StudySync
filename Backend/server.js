const express=require('express');
const app=express();
const cors=require('cors');
const aiRoutes=require('./routes/aiRoutes')
const userRoutes=require('./routes/userRoutes')
const cookieParser=require('cookie-parser')
const connectDB=require('./db/db')
connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser())

app.use('/ai',aiRoutes);
app.use('/users',userRoutes);

app.listen(3000,()=>{
    console.log("server is running on port 3000");
})