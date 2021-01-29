// import packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

// set up for serving vue
const path = __dirname + '/dist/';
app.use(express.static(path));

// import routes
const appRoutes = require("./routes/app-routes.js");

// initialize middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(compression());

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS, POST, DELETE, PUT, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// routes
app.use(appRoutes);

app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});

app.get('/timer', function (req,res) {
  res.sendFile(path + "index.html");
});

app.get('/signin', function (req,res) {
  res.sendFile(path + "index.html");
});

app.get('/signup', function (req,res) {
  res.sendFile(path + "index.html");
});

app.get('/dashboard', function (req,res) {
  res.sendFile(path + "index.html");
});

app.get('/settings', function (req,res) {
  res.sendFile(path + "index.html");
});

// error handling middleware
app.use((err, req, res, next) => {
  // console.log(err.message);
  return res
    .status(err.statusCode)
    .json({ message: err.message, data: err.data });
});

// catch all route
app.get("*", (req, res, next) => {
  res.status(404).json({
    message: "This request cannot be supported!",
  });
});

// port set up and db connection
async function connect() {
  try {
    options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(process.env.MONGO_URI, options);
    app.listen(8080);
    console.log("connected!");
  } catch (err) {
    console.log("connection failed", err);
  }
}
connect();

// const db = new MongoClient('MONGO_URI').connect()
//     .then(db => {
//         console.log('connected!');
//         app.listen(3000);
//     })
//     .catch(err => {
//         console.log('could not connect', err);
//     })
