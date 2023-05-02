
const jwt=require("jsonwebtoken");
const {userModle}=require("../modle/user_model");
const {redisclient} = require("../helpers/redis");
require("dotenv").config();


const authentocator=async(req,res,next)=>{
  try {
        
    const token=req.headers?.authorization?.split(" ")[1];
    
    if(!token){
        return res.status(403).send({"msg":"login again"})
    }

    const isTokenValid=await jwt.verify(token,process.env.secreateKey)

    if(!isTokenValid){
        return res.send({"msg":"Athentication failed"})
    }

    // console.log(token)
    const isTokenBlacklisted= await redisclient.set(token,1);

    // console.log(isTokenBlacklisted)

    if(isTokenBlacklisted){
        //res.status(200).json({"msg":"Unothorized"});
        console.log("Unothorised");
      
    }

    const {userId}=isTokenValid;
    const user=await userModle.findOne({_id:userId});

 
    next();


} catch (error) {
    res.send(error.message)
}
};

// define IP validation middleware
const validateIP = (req, res, next) => {
    const ip = req.params.ip;
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ message: 'Invalid IP address' });
    }
    next();
  };



module.exports={
    authentocator,
    validateIP
}