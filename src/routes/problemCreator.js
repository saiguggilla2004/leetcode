const express=require("express")
const problemRouter=express.Router()
const adminMiddleware=require("../middleware/adminMiddleware");
const userMiddleWare=require("../middleware/userMiddleware")
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem,
} = require("../controllers/userProblem");

//create the problem
problemRouter.post("/create",adminMiddleware, createProblem);
problemRouter.get("/ProblemById/:id", userMiddleWare, getProblemById);
problemRouter.get("/getAllProblem", userMiddleWare,getAllProblem);


problemRouter.put("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/:id",adminMiddleware, deleteProblem);
problemRouter.get("/ProblemSolvedByUser", userMiddleWare,solvedAllProblemByUser);
problemRouter.get("/submittedProblem/:pid", userMiddleWare,submittedProblem); 
//fetch

// module.exports=problemRouter;
module.exports = problemRouter;
//update 


//delete