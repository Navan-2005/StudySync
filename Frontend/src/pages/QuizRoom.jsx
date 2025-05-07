import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
export const QuizRoom = () => {

    const {user}=useSelector((state)=>state.user);
    const navigate=useNavigate();
    const handlecreate=async(e)=>{
        try {
        const response=await axios.post('http://localhost:3000/rooms/create', { userId: user._id,username:user.username });
        console.log(response);
        navigate('/quiz',{state:{roomId:response.data.roomId}});
        } catch (error) {
            console.log('Error : ',error);            
        }
    }

  return (
    <div>
        <button onClick={handlecreate}>Create Room</button>
    </div>
  )
}
