const mongoose = require('mongoose');

const user=new mongoose.Schema({
    username: {
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
    }
})

const quizSchema = new mongoose.Schema({
    quizID: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    users:[user],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports =mongoose.model('QuizModel', quizSchema)
