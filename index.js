const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');

const {generateFile}=require('./generateFile');
const {executeCpp}=require("./executeCpp");
const { executePy } = require('./executePy');
const Job=require("./models/Job")

mongoose.connect('mongodb://localhost:27017/compilerdatabase', {useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
    if(err){
       console.error(err);
       process.exit(1);

    }
    console.log("successfully connected with mongodb");
});

const app=express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get("/status",async(req,res)=>{

    const jobId=req.query.id;
    console.log("status requested",jobId);
    if(jobId == undefined){
        return res.status(400).json({success:false,error:"missing id query param"})
    }
    try{
    const job=await Job.findById(jobId);

    if(job == undefined){
        return res.status(404).json({success:false,error:"invalid job id"}); 
    }
    return res.status(200).json({success:true, job});

    }catch (err){
        return res.status(400).json({success:false,error:JSON.stringify(err)});
    }
});

app.post('/run',async (req,res)=>{
    
    const {language="cpp",code}=req.body;
    console.log(language,code.length);
    if(code===undefined){
        return res.status(400).json({success:false,error:"Empty code body!"});
    }

    let job;

    try{
    // need to generate a c++ file with content from the request

    const filepath=await generateFile(language,code)
    //we need to run the file and send the response  
    job=await new Job({language,filepath}).save();
    const jobId=job["_id"];
    console.log(job);
    res.status(201).json({success:true,jobId});
    


    let output;

    job["startedAt"]=new Date();

    if(language==="cpp"){
         output=await executeCpp(filepath);
    }
    else{
        output=await executePy(filepath);
    }
    job["completedAt"]=new Date();
    job["status"]="success";
    job["output"]=output;

    await job.save();

    console.log(job);

    // return res.json({filepath,output});
    }catch(err){
        job["completedAt"]=new Date();
        job["status"]="error";
        job["output"]=JSON.stringify(err);
        await job.save();

        console.log(job);
        // res.status(500).json({err});
    }
});

app.listen(5000,()=>{
    console.log("listening at port 5000 ")
});