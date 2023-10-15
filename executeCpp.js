const {exec}=require('child_process');
const fs=require('fs');
const path=require('path');

const outputPath=path.join(__dirname,'outputs');

if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive:true});
}

const executeCpp=(filepath)=>{
    // F:\online_compiler\backend\codes\d4bf191d-c55a-4cf3-9d79-bcf2f4f976dc.cpp 

    const jobId=path.basename(filepath).split(".")[0];
    const outPath=path.join(outputPath,`${jobId}.out`);
    // console.log(filepath);
    // console.log(outPath);
    // console.log(outputPath);
    // console.log(jobId);
    return new Promise((resolve,reject)=>{

     exec(
        `g++ ${filepath} -o ${outPath} && cd ${outputPath} && .\\${jobId}.out`,
            (error,stdout,stderr)=>{
               error && reject({ error,stderr}); 
               stderr && reject(stderr);
               resolve(stdout);
            }
        );
    });
};

module.exports={
   executeCpp 
}