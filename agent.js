import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync"

const ai = new GoogleGenAI({apiKey:process.env.API_KEY});

function sum({num1,num2}){
 return num1+num2
}

function prime({num}){
  if(num<2){
    return false;
  }

  for(let i=2;i<Math.sqrt(num);i++)
  {
    if(num%i==0) return false
  }
  return true
}

function multiply({ num1, num2 }) {
    return num1 * num2;
}

const sumDeclaration={
    name:"sum",
    description:"Get the sum of two numbers",
    parameters:{
        type:"OBJECT",
        properties:{
            num1:{
                type:"NUMBER",
                description:"It will the first number in addition"
            },
             num2:{
                type:"NUMBER",
                description:"It will the second number in addition"
            }
        },
        required:["num1","num2"]
    }
}

const primeDeclaration={
    name:"prime",
    description:"Get the prime number of any number",
    parameters:{
        type:"OBJECT",
        properties:{
            num:{
                type:"NUMBER",
                description:"It will the number whose prime number is to be found"
            },
        },
        required:["num"]
    }
}


const multiplyDeclaration = {
    name: "multiply",
    description: "Multiply two numbers",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: {
                type: "NUMBER",
                description: "The first number"
            },
            num2: {
                type: "NUMBER",
                description: "The second number"
            }
        },
        required: ["num1", "num2"]
    }
};

const History=[]
const availableTools={
    sum:sum,
    prime:prime,
    multiply:multiply
}


async function userAgent(userProblem){
    History.push({
        role:"user",
        parts:[{text:userProblem}]
    })

    while(true){


        const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: History,
        config:{
            tools:[{
                functionDeclarations:[sumDeclaration ,primeDeclaration,multiplyDeclaration]
            }]
        }
      });

       History.push(response.candidates[0].content);

    
      if(response.functionCalls && response.functionCalls.length>0){
         const {name,args}=response.functionCalls[0]
         const funCall=availableTools[name]
         const result=await funCall(args)
    
         const functionResponsePart={
            name:name,
            response:{
                result:result
            }
         }
    
          //result
           History.push({
            role:"user",
            parts:[{functionResponse:functionResponsePart}]
          })
    
      }else{
    
          History.push({
            role:"Model",
            parts:[{text:response.text}]
          })
        
          console.log("\n")
          console.log(response.text)
          break
      }

    }


}

async function main() {
  const userProblem=readlineSync.question("Ask me anything---")
  await userAgent(userProblem)
  main()
}

main();