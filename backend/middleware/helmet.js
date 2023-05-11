const express = require('express');
const helmet = require('helmet');

const app = express();

// Apply helmet middleware to the app
app.use(helmet({
    crossOriginResourcePolicy: {policy: "same-site"},
    crossOriginEmbedderPolicy: {policy: "require-corp"}
}));