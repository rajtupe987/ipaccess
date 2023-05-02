const express=require("express");
const {connection}=require("./config/db");
const {UserRoute}=require("./Routes/user_route");
const {ipRoute}=require("./Routes/ip.route")
const {authentocator}=require("./middleware/Authenticator");
require("dotenv").config();
const winston=require("winston");

const { createLogger, transports,format } = winston;
const passport=require("passport")

const app=express();
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("HOME")
})


app.use("/user",UserRoute);
app.use("/access",authentocator,ipRoute);




  



app.listen(process.env.port,async()=>{
    try {
        await connection
        console.log("connected to db")
    } catch (error) {
        console.log(error)
    }
    console.log(`port no is ${process.env.port}`)
})