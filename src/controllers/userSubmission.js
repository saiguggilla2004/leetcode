const Submission=require("../models/submission");
const Problem = require("../models/problem");
const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");


const submitCode=async (req,res)=>{
    const problemId=req.params.id;
    try{
      const userId = req.user._id;
      if (!problemId) {
        return res.status(400).send("Invalid Problem ID");
      }
      if (!userId) {
        return res.status(400).send("Invalid User ID");
      }

      const { code, language } = req.body;
      if (!code || !language) {
        return res.status(400).send("Code and Language are required");
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).send("Problem not found");
      }

      const submission = await Submission.create({
        userId,
        problemId,
        code,
        language,
        testCasesPassed: 0,
        testCasesTotal: problem.hiddenTestCases.length,
        status: "pending",
        runtime: 0,
        memory: 0,
      });

      //submit the code to judge0
      const languageId = getLanguageById(language);

      //creating a batch for submission
      const submissions = problem.hiddenTestCases.map((testcase) => ({
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      console.log("test result", testResult);
      //   //update the submission status based on the results
      let testCasesPassed = 0;
      let runtime=0;
      let memory=0;
      let status="accepted";
      let errorMessage="";
      for (const test of testResult) {
          if (test.status_id === 3) { // Accepted
              testCasesPassed++;
              runtime += parseFloat(test.time); // Assuming time is in seconds
          memory=Math.max(memory,test.memory)
          }
          else {
            if(test.status_id===4)
            {
                status="error";
                errorMessage=test.stderr;
            }
            else
            {
                status="wrong";
                errorMessage=test.stderr;
            }
          }

      // }
      // submission.testCasesPassed = testCasesPassed;
      // submission.testCasesTotal = testResult.length;
      // submission.status = testCasesPassed === testResult.length ? "accepted" : "wrong";
    }

    //store the submission in the database
        submission.testCasesPassed = testCasesPassed;
        submission.testCasesTotal = testResult.length;
        submission.status = status;
        submission.runtime = runtime;
        submission.memory = memory;
        submission.errorMessage = errorMessage;
    
        await submission.save();
     
       if(!req.user.problemSolved.includes(problemId))
       {
           req.user.problemSolved.push(problemId);
           await req.user.save();
       }

        res.status(201).send(submission);
        }
    catch(e)
    {
        return res.status(400).send("Error Occured: " + e.message);
    }
}


const runCode=async (req,res)=>{
  const problemId = req.params.id;
  try {
    const userId = req.user._id;
    if (!problemId) {
      return res.status(400).send("Invalid Problem ID");
    }
    if (!userId) {
      return res.status(400).send("Invalid User ID");
    }

    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).send("Code and Language are required");
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

  

    //submit the code to judge0
    const languageId = getLanguageById(language);

    //creating a batch for submission
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    console.log("test result", testResult);
    //   //update the submission status based on the results
    

    //store the submission in the database
   
res.status(200).send(testResult);

  

  } catch (e) {
    return res.status(400).send("Error Occured: " + e.message);
  }
}
module.exports = {
  submitCode,
  runCode,
};