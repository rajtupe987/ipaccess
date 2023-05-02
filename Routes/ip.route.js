
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ipModle } = require("../modle/ip.model");
require("dotenv").config();
const passport=require("passport");
const mongoose = require('mongoose');
const {redisclient}=require("../helpers/redis") 
const winston=require("winston");
const { createLogger, transports,format } = winston;
const {validateIP}=require("../middleware/Authenticator")
const ipRoute = express.Router();
const {MongoDB} = require('winston-mongodb')
const axios=require("axios")
ipRoute.use(passport.initialize());

ipRoute.get("/", async (req, res) => {
    try {
        res.status(200).send({ msg: "your data" })
    } catch (error) {
        res.status(400).send(error.message)
    }
})



  const logger = createLogger({
    level: 'info',
    format: format.combine(
     format.timestamp(),
     format.json()
    ),
    transports: [
      new transports.MongoDB({
        level: 'error',
        db: process.env.Mongo_url,
        options: { useUnifiedTopology: true },
        collection: 'logs'
      })
    ]
  });


ipRoute.get('/ip/:ip', validateIP, (req, res) => {
    const ip = req.params.ip;
    // check if IP data is in Redis cache
    redisclient.get(ip, (err, reply) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (reply) {
            const ipInfo = JSON.parse(reply);
            return res.json(ipInfo);
        }
        axios.get("https://ipapi.co/8.8.8.8/json/")
            .then(response => {
                const ipInfo = {
                    ip: response.data.ip,
                    city: response.data.city
                };
             
                redisclient.set(ip, JSON.stringify(ipInfo), 'EX', 21600, err => {
                    if (err) {
                        logger.error(err);
                    }
                });
                const userId = req.user;
                const search = { ip, city: ipInfo.city };
                mongoose.connection.db.collection(userId).insertOne(search, err => {
                    if (err) {
                        logger.error(err);
                    }
                });
                res.json(ipInfo);
            })
            .catch(error => {
                logger.error(error);
                res.status(500).json({ message: 'Internal server error' });
            });
    });
});


module.exports = {
    ipRoute
}