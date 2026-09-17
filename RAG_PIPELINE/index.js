import * as dotenv from 'dotenv';
dotenv.config()
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone'; 
import { PineconeStore } from '@langchain/pinecone';

const CHUNK_SIZE=1000
const CHUNK_OVERLAP=200



async function indexDocument(){
    //laoding the document
    const PDF_PATH = './Dsa.pdf';
const pdfLoader = new PDFLoader(PDF_PATH);
const rawDocs = await pdfLoader.load();

console.log("PDF LOADED")

//chunking the document
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

console.log("DOCUMENT CHUNKED")
  //vector embedding models
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001",
    outputDimensionality:768
  });

  console.log("CONFIGURED THE EMBEDDING")


  //database configuration
  //initialize pinecone client
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

console.log("INITIALIZED PINACONE CLIENT")

//langchain(chunk,embedding,database) i will do it for you
// await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
//     pineconeIndex,
//     maxConcurrency: 5,
//   });

const BATCH_SIZE = 50;

for (let i = 0; i < chunkedDocs.length; i += BATCH_SIZE) {
  const batch = chunkedDocs.slice(i, i + BATCH_SIZE);

  console.log(
    `Embedding ${i + 1}-${i + batch.length} / ${chunkedDocs.length}`
  );

 const vectors = [];

for (const doc of batch) {
  const vector = await embeddings.embedQuery(doc.pageContent);
  vectors.push(vector);
}

  console.log(vectors[0]);
console.log(vectors[0]?.length);

 const records = vectors.map((vector, index) => ({
  id: `dsa-${i + index}`,
  values: vector,
  metadata: {
    text: batch[index].pageContent,
    source: PDF_PATH,
    page: batch[index].metadata?.loc?.pageNumber ?? 0,
  },
}));


  await pineconeIndex.upsert(records);

  console.log(`Uploaded ${records.length} vectors`);
}

console.log("DATA SAVED IN THE DATABASE");
  

}

indexDocument()
