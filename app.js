require("dotenv").config();

const express = require('express');
const cors = require('cors')
const app = express();
const apiRouter = require('./api');
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRouter)

module.exports = app;