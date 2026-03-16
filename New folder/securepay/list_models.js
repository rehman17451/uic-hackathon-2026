import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AIzaSyB1hY8JS2zuSLlAwSHJhQAG0clMY_5F78A";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // There is no listModels method in the generic JS SDK sometimes, but wait
    // We can just try to fetch the REST API directly to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:", JSON.stringify(data.models?.map(m => m.name) || data, null, 2));
  } catch(e) {
    console.error("ERROR", e);
  }
}
listModels();
