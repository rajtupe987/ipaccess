const express=require("express");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const {userModle}=require("../modle/user_model");
const {redisclient} = require("../helpers/redis");
const {authentocator}=require("../middleware/Authenticator");
require("dotenv").config();
const UserRoute=express.Router();

UserRoute.post("/register",async(req,res)=>{
    try {
        const payload=req.body;
        const User=await userModle.findOne({email:payload.email});

        if(User){
            return res.status(200).send({"msg":"User Already Have an Account please try with another details"});

        }else{
            const hashpassword=await bcrypt.hashSync(payload.password,6);
            payload.password=hashpassword;
            const newuser=new userModle(payload);
            await newuser.save()
            return res.status(200).send({"msg":"User has been Registered",user:newuser})
        }
    } catch (error) {
        res.send({"msg":error.message})
    }
})





UserRoute.post("/login",async(req,res)=>{
    try {
        const payload=req.body;
        const User=await userModle.findOne({email:payload.email});
        if(!User){
            return res.send("please signup")
        }
        const accuratepass=await bcrypt.compareSync(payload.password,User.password);
        if(accuratepass){
            const token=await jwt.sign({email:User.email,userId:User._id},process.env.secreateKey,{expiresIn:"6m"});

            const refrestoken=await jwt.sign({email:User.email,userId:User._id},process.env.refreshkey,{expiresIn:"7m"})
            res.status(200).send({"msg":"succesfull login..",token,refrestoken})
        }else{
            res.status(400).send({"msg":"Invalid data..."})
        }
    } catch (error) {
        res.status(400).send(error.message)
    }
});



UserRoute.get("/logout",authentocator,async(req,res)=>{
    
    try {
        const token=req.headers?.authorization?.split(" ")[1];
        
        if(!token){
            return res.status(403).send({"msg":"Unothorized"})
        }
        await redisclient.set(token,1);
        res.send("succesfull logout..")
    } catch (error) {
        res.status(500).send({ "msg": error.message })
    }

});



UserRoute.get("/refresh",(req,res)=>{

    const refreshtoken=req.headers.authorization?.split(" ")[1];
    const decoded=jwt.verify(refreshtoken,process.env.refreshkey);

    if(decoded){
       const token=jwt.sign(({email:decoded.email,userId:decoded._id},process.env.key,{expiresIn:"1m"}))
       return req.send(token)
    }else{
        res.status(400).send({"msg":"Invalid refresh toekn, login agian......"})
    }
    res.send("new token")
});


module.exports={
    UserRoute
}