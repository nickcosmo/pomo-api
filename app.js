// import packages
const express = require("express");
const bodyParser = require("body-parser");
// const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// import routes
const userRoutes = require("./routes/user-routes.js");

// initialize middleware
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use(userRoutes);

// port set up and db connection
async function connect() {
    try {
        options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        await mongoose.connect(process.env.MONGO_URI, options);
        await app.listen(3000);
        console.log('connected!');
    }
    catch(err) {
        console.log(err);
    }
}

connect();

// const db = new MongoClient('mongodb+srv://nicklans:zoBToADRKsy922sW@cluster0.wajbx.mongodb.net/pomo?retryWrites=true&w=majority').connect()
//     .then(db => {
//         console.log('connected!');
//         app.listen(3000);
//     })
//     .catch(err => {
//         console.log('could not connect', err);
//     })
