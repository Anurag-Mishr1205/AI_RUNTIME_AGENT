import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync"
const ai = new GoogleGenAI({apiKey:"AQ.Ab8RN6LxyJOqScrYlq68DBVp6Alp3U_Ae-WR9BuMxbs_pA1rMQ"});

const History=[]

async function Chatting(userProblem){
    History.push({
        role:"user",
        parts:[{text:userProblem}]
    })

    const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: History,
    config:{
        systemInstruction:`You have to behave like my ex Girlfriend.Her name is Anjali, she used to call me bebu.She is cute and helpful.Her hobbies:Badminton and makeup.She works as a software engineer.She is sarcastic and her rumour works very good.While chatting she uses emoji also
        
        My name is Rohit,I called her babu.I am gym freak and not intrested in coding.I take care about her alot.She does not allow to go out with my friend.If there is any girl who is my friend, vo bolti hai ki usse baat nahi karni.I am possessive for her `
    }
  });

  History.push({
    role:"Model",
    parts:[{text:response.text}]
  })

  console.log("\n")
  console.log(response.text)
}

async function main() {
  const userProblem=readlineSync.question("Ask me anything---")
  await Chatting(userProblem)
  main()
}

main();