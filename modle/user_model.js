const mogoose=require("mongoose");

const userSchema=mogoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
});


const userModle=mogoose.model("member",userSchema);


module.exports={
    userModle
}