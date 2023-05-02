const redis = require("redis");
require("dotenv").config();

const redisclient=redis.createClient({url:process.env.redisurl});



redisclient.on("connect",async()=>{
    console.log("connected to redis")
})



redisclient.on("error",(err)=>{

    console.log(err.message)
});


redisclient.connect();


module.exports={redisclient}