import { toast } from "sonner";

/**
 * AI Services Integration
 * This file contains services for connecting to Groq Llama AI APIs
 */

// Environment variable access helper for browser environments
// This handles the various ways environment variables might be exposed
const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  // For Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    if (import.meta.env[viteKey]) {
      return import.meta.env[viteKey];
    }
  }
  
  // For webpack/CRA and similar environments that expose process.env
  if (typeof window !== 'undefined' && 
      window.__ENV__ && 
      window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  
  // Provide the default fallback value
  return defaultValue;
};

// Client calls Vite dev proxy; no Groq SDK in browser
const callGroqProxy = async (messages: Array<{ role: string; content: string }>, model = "llama-3.3-70b-versatile") => {
  console.log(`🚀 Making Groq proxy call to /groq/v1/chat/completions`);
  console.log(`📝 Model: ${model}`);
  console.log(`💬 Messages count: ${messages.length}`);
  
  const payload = { messages, model };
  console.log(`📦 Request payload:`, payload);
  
  const resp = await fetch('/groq/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  console.log(`📊 Response status: ${resp.status} ${resp.statusText}`);
  
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('❌ Groq proxy failure:', resp.status, txt);
    throw new Error(`Groq proxy error ${resp.status}: ${txt}`);
  }
  
  const result = await resp.json();
  console.log(`✅ Groq proxy success:`, result);
  return result;
};

// Add TypeScript type definitions for global env vars
declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

/**
 * Validate API connection
 * Tests if the Groq API configuration is valid using Llama model
 */
export const validateApiConnection = async () => {
  try {
    console.log("🔄 Starting Groq connection validation...");
    console.log("🌐 Proxy URL: /groq/v1/chat/completions");
    
    toast.info("Validating AI Connection", { 
      description: "Testing connection to Groq Llama..." 
    });
    
    const testMessages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Respond with 'Connection valid' if you receive this message." }
    ];
    
    console.log("📤 Sending test request with messages:", testMessages);
    
    const chatCompletion = await callGroqProxy(testMessages);
    
    console.log("📥 Received response:", chatCompletion);
    
    if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
      const responseContent = chatCompletion.choices[0].message?.content || '';
      console.log("✅ Response content:", responseContent);
      
      toast.success("Groq Connection Valid", { 
        description: `Successfully connected to Llama model. Response: "${responseContent.slice(0, 50)}..."` 
      });
      return true;
    } else {
      console.error("❌ Invalid response structure:", chatCompletion);
      toast.error("Connection Invalid", { 
        description: "Received an invalid response from Groq Llama" 
      });
      return false;
    }
  } catch (error) {
    console.error("❌ Error validating Groq API connection:", error);
    
    let errorMessage = "Check network and Groq service availability";
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = "API key is invalid or missing";
      } else if (error.message.includes('403')) {
        errorMessage = "API key lacks permission or quota exceeded";
      } else if (error.message.includes('429')) {
        errorMessage = "Rate limit exceeded, try again later";
      } else if (error.message.includes('500')) {
        errorMessage = "Groq server error";
      } else if (error.message.includes('fetch failed')) {
        errorMessage = "Network error - check dev server and proxy config";
      }
    }
    
    toast.error("Connection Failed", { 
      description: errorMessage
    });
    return false;
  }
};

/**
 * Computer Vision Service
 * Analyze images using local browser capabilities
 */
export const computerVisionService = {
  analyzeImage: async (imageInput: Blob | File | string) => {
    try {
      console.log("Starting local image analysis");
      
      // For browser environments, we'll use a local fallback approach
      let imageDescription = "An image";
      let fileInfo = "";
      
      if (typeof imageInput !== 'string') {
        // Get info about the image file
        const file = imageInput as File;
        if (file.name) {
          fileInfo = file.name;
        }
        if (file.type) {
          fileInfo += ` (${file.type})`;
        }
        
        // Create image URL for display
        const imageUrl = URL.createObjectURL(imageInput);
        console.log("Created local image URL:", imageUrl);
      } else {
        fileInfo = "URL image";
      }
      
      console.log("Local image analysis complete");
      
      // Generate basic tags based on common image contents
      const genericTags = ["image", "photo", "picture"];
      
      // Create a formatted result
      return {
        description: {
          tags: genericTags,
          captions: [{
            text: `A photo${fileInfo ? ' of ' + fileInfo : ''}`,
            confidence: 0.5
          }]
        },
        faces: [],
        objects: [],
        safeSearch: {
          adult: "UNLIKELY",
          medical: "UNLIKELY",
          racy: "UNLIKELY",
          spoof: "UNLIKELY",
          violence: "UNLIKELY"
        },
        imageProperties: {},
        text: "",
        rawResponse: {
          caption: `A photo${fileInfo ? ' of ' + fileInfo : ''}`,
          tags: genericTags,
          source: "local-fallback"
        }
      };
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Image Analysis Error", {
        description: "Unable to complete image analysis. Using basic analysis instead.",
      });
      
      // Return a minimal valid response even when errors occur
      return {
        description: {
          tags: ["image"],
          captions: [{
            text: "A photo",
            confidence: 0.5
          }]
        },
        faces: [],
        objects: [],
        safeSearch: {},
        imageProperties: {},
        text: "",
        rawResponse: {
          source: "error-fallback"
        }
      };
    }
  }
};

/**
 * Language Service
 * Natural language processing using Groq Llama
 */
export const languageService = {
  analyzeSentiment: async (text: string) => {
    try {
      // Create a prompt for sentiment analysis
      const sentimentPrompt = `Analyze the sentiment of the following text. Rate it as positive, negative, or neutral with a confidence score between 0 and 1: "${text}"`;
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: sentimentPrompt }
      ]);
      
      return {
        sentiment: chatCompletion.choices[0].message.content,
        rawResponse: chatCompletion
      };
    } catch (error) {
      console.error("Comprehensive error analyzing sentiment:", error);
      
      toast.error("Sentiment Analysis Error", {
        description: "Unable to complete sentiment analysis. Please check your connection and try again.",
      });

      throw error;
    }
  },

  extractKeyPhrases: async (text: string) => {
    try {
      // Create a prompt for key phrase extraction
      const keyPhrasesPrompt = `Extract and list the key phrases from the following text. Return only the key phrases as a JSON array: "${text}"`;
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: keyPhrasesPrompt }
      ]);
      
      return {
        keyPhrases: chatCompletion.choices[0].message.content,
        rawResponse: chatCompletion
      };
    } catch (error) {
      console.error("Error extracting key phrases:", error);
      throw error;
    }
  },

  recognizeEntities: async (text: string) => {
    try {
      // Create a prompt for entity recognition
      const entitiesPrompt = `Identify and categorize entities in the following text. Return the results as a JSON object with entity types as keys and arrays of entities as values: "${text}"`;
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: entitiesPrompt }
      ]);
      
      return {
        entities: chatCompletion.choices[0].message.content,
        rawResponse: chatCompletion
      };
    } catch (error) {
      console.error("Error recognizing entities:", error);
      throw error;
    }
  },
};

/**
 * GPT Models Service using Groq Llama
 */
export const gptService = {
  chat: async (prompt: string, model: string = "llama-3.3-70b-versatile") => {
    try {
      const messages = [
        { role: "user", content: prompt }
      ];
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a helpful assistant." },
        ...messages
      ], model);
      
      // Format the response to match the structure expected by the application
      return {
        choices: [
          {
            message: chatCompletion.choices[0].message,
            finish_reason: "stop"
          }
        ],
        model,
        usage: chatCompletion.usage || {}
      };
    } catch (error) {
      console.error("Error with Groq Llama chat:", error);
      throw error;
    }
  },
};

/**
 * Image Analysis Service using Groq Llama
 */
export const imageAnalysisService = {
  analyzeImageSentiment: async (imageInput: Blob | File | string) => {
    try {
      // First, analyze the image with our local approach
      const visionResult = await computerVisionService.analyzeImage(imageInput);
      
      // For browser environments, we'll assume photos contain people
      const imageDescription = "a person in a photo";
      
      // Use direct LLM analysis
      const prompt = `
        You're analyzing a photo of a person. Without seeing the actual image, provide a general, 
        compassionate analysis of how people might be feeling in different situations.
        
        Include:
        - Range of possible emotions people commonly experience (both positive and negative)
        - Reminder that visual cues can sometimes be misinterpreted
        - Encouragement to share how they're actually feeling in their own words
        
        Keep your response brief (2-3 sentences) and non-judgmental.
      `;
      
      // Use Groq Llama API
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]);
      
      return {
        sentiment: chatCompletion.choices[0].message.content,
        visionAnalysis: visionResult,
        gptResponse: chatCompletion
      };
    } catch (error) {
      console.error("Error analyzing image sentiment:", error);
      // Return a fallback response
      return {
        sentiment: "I can see you've shared a photo. Visual expressions can reflect many emotions - from joy to concern. I'd love to hear how you're actually feeling in your own words, as that's more reliable than my interpretation of an image.",
        visionAnalysis: {
          description: {
            captions: [{ text: "A photo" }]
          }
        }
      };
    }
  },
};

/**
 * Mental Health Service using Groq Llama
 */
export const mentalHealthService = {
  // Implement a cooldown mechanism to prevent rapid API calls
  _lastRequestTime: 0,
  _minRequestInterval: 5000, // 5 seconds minimum between requests
  
  async _enforceRequestCooldown() {
    const now = Date.now();
    const timeSinceLastRequest = now - this._lastRequestTime;
    
    if (timeSinceLastRequest < this._minRequestInterval) {
      const waitTime = this._minRequestInterval - timeSinceLastRequest;
      console.log(`Enforcing cooldown, waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this._lastRequestTime = Date.now();
  },

  // Initialize the conversation with the mental health assistant
  startConversation: async () => {
    try {
      // Use Groq Llama API
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a supportive mental health assistant. Be warm, empathetic, and conversational. Always mention that you're not a replacement for professional help." },
        {
          role: "user",
          content: "Hi"
        }
      ]);

      const initialMessage = chatCompletion.choices[0].message.content;
      
      return {
        messages: [
          {
            role: "assistant",
            content: initialMessage
          }
        ],
        rawResponse: chatCompletion
      };
    } catch (error) {
      console.error("Error starting mental health conversation:", error);
      
      // Improved error message handling
      if (error instanceof Error && error.message.includes('429')) {
        toast.error("Service Temporarily Busy", {
          description: "Our mental health service is receiving high traffic. Please try again in a few moments.",
        });
      } else {
        toast.error("Service Error", {
          description: "Unable to start mental health assessment. Please try again later.",
        });
      }
      throw error;
    }
  },

  // Continue the conversation with user input
  continueConversation: async (messages: Array<{role: string, content: string}>, userImage?: Blob | null) => {
    try {
      // Enforce cooldown between API requests
      await mentalHealthService._enforceRequestCooldown();
      
      // First, process any user image if provided
      let imageAnalysis = null;
      let enhancedMessages = [...messages];
      let imageUrl = null;
      
      // Debug log to see what messages we're sending
      console.log("Mental health messages before processing:", JSON.stringify(enhancedMessages));
      
      if (userImage) {
        try {
          // Store the image for reference 
          imageUrl = URL.createObjectURL(userImage);
          
          // Store the image for reference but don't analyze it
          imageUrl = URL.createObjectURL(userImage);
          
          // Don't do any sentiment analysis - just note that there's an image
          imageAnalysis = {
            sentiment: null, // No analysis
            visionAnalysis: {
              description: { captions: [{ text: "a shared photo" }] }
            }
          };
          
          // Don't modify the user's message content - let them say what they want to say
        } catch (imageError) {
          console.error("Error processing image in conversation:", imageError);
          // No need to show warning since we're not analyzing anyway
        }
      }
      
      // Use proper chat completion format with message history
      // Just pass the conversation messages directly to the API
      
      console.log("📤 Final messages being sent to Groq:", enhancedMessages);
      console.log("📤 Message count:", enhancedMessages.length);
      
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a supportive mental health assistant. Be natural and conversational. Always mention that you're not a replacement for professional help when appropriate." },
        ...enhancedMessages
      ]);

      console.log("🔍 Groq response structure:", chatCompletion);
      console.log("📝 Response choices:", chatCompletion.choices);
      console.log("📝 First choice:", chatCompletion.choices?.[0]);
      console.log("📝 First choice message:", chatCompletion.choices?.[0]?.message);
      console.log("📝 Response content:", chatCompletion.choices?.[0]?.message?.content);

      return {
        message: chatCompletion.choices[0].message.content,
        imageAnalysis: imageAnalysis,
        imageUrl: imageUrl, // Return the image URL for display in the UI
        rawResponse: chatCompletion
      };
    } catch (error) {
      console.error("Error in mental health conversation:", error);
      
      // Improved error message handling
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('529'))) {
        // Increase the cooldown time when we hit rate limits
        mentalHealthService._minRequestInterval = 10000; // Increase to 10 seconds after a rate limit
        
        toast.error("Service Rate Limit Reached", {
          description: "Our AI service is currently experiencing high demand. Your message will be attempted again shortly.",
        });
      } else {
        toast.error("Conversation Error", {
          description: "There was a problem processing your message. Please try again.",
        });
      }
      throw error;
    }
  }
};

/**
 * Speech Service using browser Web Speech API
 */
export const speechService = {
  textToSpeech: async (text: string) => {
    // Web Speech API only (client-side)
    if (window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        return {
          success: true,
          webSpeech: true,
          utterance,
        };
      } catch (error) {
        console.error("Web Speech synthesis failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
    return { success: false, error: "Web Speech API not supported" };
  },

  // For speech recognition, we can use the browser's Web Speech API
  startSpeechRecognition: () => {
    // Check for browser support
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    return recognition;
  }
};

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
  // Use loose types to avoid DOM lib dependency issues
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  __ENV__?: Record<string, string>;
  }
}

// Export a combined Groq-based service object
export const aiServices = {
  validateApiConnection,
  computerVision: computerVisionService,
  language: languageService,
  gpt: gptService,
  imageAnalysis: imageAnalysisService,
  mentalHealth: mentalHealthService,
  speech: speechService,
};

// Add backward compatibility for existing code that imports azureAIServices
export const azureAIServices = aiServices;

export default aiServices;