const express=require("express")
const app=express();
require("dotenv").config();
const main=require("./config/db")
const cookieParser=require("cookie-parser")

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRouter=require("./routes/userAuth");
const problemRouter=require("./routes/problemCreator")
const submitRouter=require("./routes/submit");
const redisClient = require("./config/redis");


app.use("/user",authRouter)
app.use("/problem",problemRouter)
app.use("/submission",submitRouter)

const InitializeConnection=async ()=>{
    try{ 
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB is Connected")

        app.listen(process.env.PORT, () => {
          console.log("server is running on port " + process.env.PORT);
        });
    }
    catch(e)
    {
   console.log("error ",e);
    }
}

InitializeConnection()

