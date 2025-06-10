const mongoose=require("mongoose");
const {Schema}=mongoose;

const submissionSchema = new Schema({
  userId:{
    type:Schema.Types.ObjectId,
    ref:"user",
    required:true,
  },
  problemId:{
    type:Schema.Types.ObjectId,
    ref:"problem",
    required:true
  },
  code:{
    type:String,
    required:true
  },
  language:{
    type:String,
    required:true,
    enum: ["cpp", "java", "python", "javascript", "csharp", "ruby", "go", "rust"] 
  },
  status:{
    type:String,
    required:true,
    enum: ["pending", "accepted", "wrong", "error"]
  },
  runtime:{
    type:Number,
    required:true
  },
    memory:{
        type:Number,
        required:true
    },
    errorMessage:{
        type:String,
        default:""
    },
    testCasesPassed:{
        type:Number,
        default:0
    },
    testCasesTotal:{
        type:Number,
       
        default:0
    }


},
{
  timestamps: true,
});

submissionSchema.index({userId:1,problemId:1});

const Submission = mongoose.model("submission", submissionSchema);

module.exports = Submission;