const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const quizResultSchema = new mongoose.Schema({
    quizId: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    quizResults: [quizResultSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
  }
  
  userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
  }
  
  userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
  }

const User = mongoose.model('User', userSchema);

module.exports = User;