const { getLanguageById, submitBatch ,submitToken} = require("../utils/ProblemUtility");
const Problem=require("../models/problem");
const Submission = require("../models/submission");

const createProblem=async (req,res)=>{
     const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator}=req.body;

     try{
   for(const {language,completeCode} of referenceSolution)
   {
    const languageId=getLanguageById(language);
    console.log("----------------------Selected Language ID:", languageId);


    //creating a batch for submission
   const submissions=visibleTestCases.map((testcase)=>({
    source_code:completeCode,
    language_id:languageId,
    stdin:testcase.input,
    expected_output:testcase.output
   }));

   const submitResult=await submitBatch(submissions);
   console.log("submit result",submitResult)
   const resultToken=submitResult.map((value)=>value.token)
   const testResult=await submitToken(resultToken)
console.log("test result",testResult)
   for(const test of testResult)
   {
      if(test.status_id !=3)
      {
      return  res.status(400).send("Error Occured");
      }
   }



   }
const userProblem=await Problem.create({
  ...req.body,
  problemCreator:req.user._id
});

res.status(201).send("problem saved succesfully")
    
     }
     catch(e)
     {
      return res.status(400).send("error occured: " + e.message);
    }
}

const updateProblem=async (req,res)=>{
  const {id}=req.params;
  try {
    const { referenceSolution, visibleTestCases, ...rest } = req.body;
    if(!id)
    {
      res.status(400).send("Invalid ID")
    }

    const DsaProblem=await Problem.findById(id);

    if (!DsaProblem)
    {
      res.status(404).send("Problem with specified ID is  not Present");
    }
      for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);
        console.log("----------------------Selected Language ID:", languageId);

        //creating a batch for submission
        const submissions = visibleTestCases.map((testcase) => ({
          source_code: completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);
        console.log("submit result", submitResult);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);
        console.log("test result", testResult);
        for (const test of testResult) {
          if (test.status_id != 3) {
            return res.status(400).send("Error Occured");
          }
        }
      }
    const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new : true})

    res.status(200).send(newProblem)
  } catch (e) {
    res.status(400).send("error occured while updating the problem: " + e.message);
  }
}

const deleteProblem=async(req,res)=>{

  const {id}=req.params;
  try{
  if(!id)
  {
    return res.status(400).send('ID is missing or undefined');
  }

  const deletedProblem=await Problem.findByIdAndDelete(id);

  if(!deletedProblem)
  {
    return res.status(404).send("problem is missing");
  }

  return res.status(200).send("problem is deleted succesfully");
  }
  catch(e)
  {
  res.status(400).send("error occured while deleting the problem")
  }

}

const getProblemById=async (req,res)=>{
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send("ID is missing or undefined");
    }

    const problem = await Problem.findById(id).select("_id title description difficulty tags visibleTestCases startCode referenceSolution ");

    if (!problem) {
      return res.status(404).send("problem is missing");
    }

    return res.status(200).send(problem);
  } catch (e) {
    res.status(400).send("error occured while fetching the problem by Id");
  }
}

const getAllProblem=async (req,res)=>{
   try{
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
  const allProblems=await Problem.find({}).select("_id title difficulty tags ")
  if(allProblems.length==0)
  {
    return res.status(400).send("Problems are missing");
  }

  res.status(200).send(allProblems)

   }
   catch(e)
   {
    res.status(400).send("error occured while getting all the problems")

   }
};


const solvedAllProblemByUser=async (req,res)=>{
//   const {id}=req.params;
//   try{
//    if(!id)
//    {
//     return res.status(400).send("ID is missing or undefined");
//    }
//   const userProblems=await Problem.find({problemCreator:id});
//   if(userProblems.length==0)
//   {
//     return res.status(404).send("No problems are solved by the user");
//   }
//   res.status(200).send(userProblems);
// }
//   catch(e)
//   {
//     res.status(400).send("error occured while fetching the problems solved by user");
//   }

try{
const userId = req.user._id;
if (!userId) {
  return res.status(400).send("Invalid User ID");
}
const userProblems = await Problem.find({ problemCreator: userId }).select("_id title difficulty tags");
if (userProblems.length === 0) {
  return res.status(404).send("No problems are solved by the user");
}
res.status(200).send(userProblems);
}
catch(e)
{
   res.status(400).send("error occured while fetching the problems solved by user: " + e.message);
}
}


const submittedProblem=async (req,res)=>{
  try{
  const userId = req.user._id;
  const problemId = req.params.pid;
  if (!userId) {
    return res.status(400).send("Invalid User ID");
  }
  if (!problemId) {
    return res.status(400).send("Invalid Problem ID");
  }

   const submissions=await Submission.find({userId,problemId});
   if(submissions.length==0)
   {
    return res.status(404).send("No submissions found for the specified problem by the user");
   }
   res.status(200).send(submissions);
  }
  catch(e)
  {
    res.status(400).send("error occured while fetching the submitted problems by user: " + e.message);
  }
}


module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem,
};