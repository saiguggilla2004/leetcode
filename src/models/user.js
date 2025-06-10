const mongoose=require("mongoose");
const {Schema}=mongoose;

const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20
    },
    lastName:{
        type:String,
        // required:true,
        minlength:3,
        maxlength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true,
    },
    age:{
        type:Number,
        // required:true,
        min:1,
        max:100
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:"problem"
        }],
        unique:true 
    },
    password:{
        type:String,
        required:true,
        minlength:4,
        maxlength:100
    },
},
{
    timestamps:true
}
);

const User=mongoose.model("User",userSchema);
module.exports=User;