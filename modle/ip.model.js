const mogoose=require("mongoose");

const ipSchema=mogoose.Schema({
    ip:{type:String,required:true},
});


const ipModle=mogoose.model("ips",ipSchema);


module.exports={
    ipModle
}