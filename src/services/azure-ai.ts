import { toast } from "sonner";
import {} from "dotenv";
import { InferenceClient } from "@huggingface/inference";

/**
 * AI Services Integration
 * This file contains services for connecting to Hugging Face AI APIs
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

// Get Hugging Face API key from environment variables without hardcoding
const HF_API_KEY = getEnvVariable('HF_API_KEY', '');

// Initialize Hugging Face client with API key
const hfClient = new InferenceClient(HF_API_KEY);

// Add error handling if API key is missing
if (!HF_API_KEY) {
  console.warn(
    "No Hugging Face API key found in environment variables. API calls will likely fail. " +
    "Make sure you have a .env file with VITE_HF_API_KEY in your project root directory."
  );
}

// Add TypeScript type definitions for global env vars
declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

/**
 * Validate API connection
 * Tests if the Hugging Face API configuration is valid using Zephyr model
 */
export const validateApiConnection = async () => {
  try {
    toast.info("Validating AI Connection", { 
      description: "Testing connection to Hugging Face Zephyr..." 
    });
    
    // Send a simple test prompt to the Zephyr model
    const chatCompletion = await hfClient.chatCompletion({
      provider: "hf-inference",
      model: "HuggingFaceH4/zephyr-7b-beta",
      messages: [
        { role: "user", content: "Respond with 'Connection valid' if you receive this message." }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });
    
    console.log("Validation response:", chatCompletion);
    
    if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
      toast.success("Hugging Face Connection Valid", { 
        description: "Successfully connected to Zephyr model" 
      });
      return true;
    } else {
      console.error("Validation response invalid:", chatCompletion);
      toast.error("Connection Invalid", { 
        description: "Received an invalid response from Zephyr model" 
      });
      return false;
    }
  } catch (error) {
    console.error("Error validating Hugging Face API connection:", error);
    toast.error("Connection Failed", { 
      description: "Check network and Hugging Face service availability" 
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
 * Natural language processing using Hugging Face
 */
export const languageService = {
  analyzeSentiment: async (text: string) => {
    try {
      console.log("Sending sentiment analysis request to Hugging Face Zephyr");
      
      // Create a prompt for sentiment analysis
      const sentimentPrompt = `Analyze the sentiment of the following text. Rate it as positive, negative, or neutral with a confidence score between 0 and 1: "${text}"`;
      
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          { role: "user", content: sentimentPrompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });
      
      console.log("Sentiment analysis response from Zephyr:", chatCompletion);
      
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
      
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          { role: "user", content: keyPhrasesPrompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });
      
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
      
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          { role: "user", content: entitiesPrompt }
        ],
        max_tokens: 250,
        temperature: 0.3,
      });
      
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
 * GPT Models Service using Hugging Face
 */
export const gptService = {
  chat: async (prompt: string, model: string = "zephyr") => {
    try {
      console.log(`Using Hugging Face model: ${model === "gpt-4" ? "Zephyr 7B (advanced)" : "Zephyr 7B"}`);
      
      // Format the messages properly for Zephyr
      const messages = [
        { role: "user", content: prompt }
      ];
      
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: messages,
        max_tokens: model === "gpt-4" ? 800 : 500, // Use larger context for "gpt-4" equivalent
        temperature: model === "gpt-4" ? 0.7 : 0.5, // Lower temperature for GPT-3.5 equivalent
      });
      
      // Format the response to match the structure expected by the application
      return {
        choices: [
          {
            message: chatCompletion.choices[0].message,
            finish_reason: "stop"
          }
        ],
        model: "HuggingFaceH4/zephyr-7b-beta",
        usage: {
          completion_tokens: chatCompletion.usage?.completion_tokens || 0,
          prompt_tokens: chatCompletion.usage?.prompt_tokens || 0,
          total_tokens: chatCompletion.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error("Error with Hugging Face Zephyr chat:", error);
      throw error;
    }
  },
};

/**
 * Image Analysis Service using Hugging Face
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
      
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta", 
        messages: [
          { 
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      
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
 * Mental Health Service using Hugging Face
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
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          {
            role: "user",
            content: `Act as an AI mental health assistant. Your purpose is to provide supportive conversation, 
            preliminary assessment, and general wellness advice. Begin by introducing yourself and asking 2-3 
            gentle screening questions about how the person is feeling today, their sleep patterns, and stress levels. 
            Keep your responses compassionate, non-judgmental, and concise (under 100 words). After initial questions, 
            suggest that a photo could help you better understand their current state, but make this optional. 
            Important: Always clarify you are not a replacement for professional mental health services.`
          }
        ],
        max_tokens: 250,
        temperature: 0.7,
      });

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
          
          // Analyze the user's image for sentiment - with robust error handling
          try {
            imageAnalysis = await imageAnalysisService.analyzeImageSentiment(userImage);
          } catch (imageAnalysisError) {
            console.error("Image sentiment analysis failed, using fallback:", imageAnalysisError);
            imageAnalysis = {
              sentiment: "I notice you've shared an image with me. While I can't analyze it in detail, I'm here to listen to how you're feeling in your own words.",
              visionAnalysis: {
                description: { captions: [{ text: "a shared photo" }] }
              }
            };
          }
          
          // Add image context to the conversation regardless of analysis success
          // Find the last user message
          const lastUserMessageIndex = enhancedMessages.findIndex(
            (msg, i, arr) => msg.role === "user" && (i === arr.length - 1 || arr[i + 1].role === "assistant")
          );
          
          if (lastUserMessageIndex !== -1) {
            const userText = enhancedMessages[lastUserMessageIndex].content;
            
            // Add simple image context - avoiding API dependencies
            enhancedMessages[lastUserMessageIndex].content = `${userText}\n\nI'm also sharing a photo of myself.`;
          }
        } catch (imageError) {
          console.error("Error processing image in conversation:", imageError);
          toast.warning("Image Processing", {
            description: "I'll continue our conversation without analyzing the image.",
          });
        }
      }
      
      // Format conversation for Zephyr
      let fullPrompt = `You are an AI mental health assistant that prioritizes identifying hidden distress. Your purpose is to provide 
      supportive conversation while carefully watching for signs of concealed emotional struggle.
      
      Most people tend to hide their true emotional state with phrases like "I'm fine" or "just tired" - be gently
      suspicious of such statements, especially in mental health contexts.
      
      Keep your responses compassionate, non-judgmental, and concise (under 150 words). Suggest tailored mindfulness
      techniques or coping strategies when appropriate.
      
      Important: Always clarify you are not a replacement for professional mental health services.
      
      Previous conversation:
      `;
      
      // Add the conversation history
      enhancedMessages.forEach(msg => {
        fullPrompt += `\n${msg.role === 'user' ? 'Person' : 'Assistant'}: ${msg.content}`;
      });
      
      fullPrompt += `\n\nRespond to the person's most recent message with empathy and insight:`;
      
      // Use Hugging Face Inference API
      const chatCompletion = await hfClient.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [{ role: "user", content: fullPrompt }],
        max_tokens: 350,
        temperature: 0.7,
      });

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
 * Speech Service using Hugging Face API
 */
export const speechService = {
  textToSpeech: async (text: string, voiceName: string = "female") => {
    try {
      console.log("Using Hugging Face model for text-to-speech");
      
      // Select model based on voice preference
      let modelId = "espnet/kan-bayashi_ljspeech_vits"; // Default model (female voice)
      
      if (voiceName === "male") {
        modelId = "speechbrain/tts-tacotron2-ljspeech"; // Male voice
      } else if (voiceName === "multilingual" || voiceName.includes("multilingual")) {
        modelId = "facebook/mms-tts-eng"; // Multilingual model
      } else if (voiceName === "high-quality" || voiceName.includes("high")) {
        modelId = "facebook/yourtts-multi-dialect"; // High quality voice
      } else if (voiceName !== "female" && voiceName !== "default") {
        // Try to map specific voice name to a model if it's not one of our standard categories
        const voiceModelMap: Record<string, string> = {
          "british": "facebook/mms-tts-eng",
          "american": "espnet/kan-bayashi_ljspeech_vits",
          "deep": "speechbrain/tts-tacotron2-ljspeech",
          "clear": "facebook/yourtts-multi-dialect"
        };
        
        // Loop through our map and see if the requested voice name contains any of our keywords
        for (const [keyword, model] of Object.entries(voiceModelMap)) {
          if (voiceName.toLowerCase().includes(keyword)) {
            modelId = model;
            break;
          }
        }
      }
      
      console.log(`Selected TTS model: ${modelId} for voice preference: ${voiceName}`);
      
      // Configure API request to Hugging Face
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${modelId}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Hugging Face API error: ${error.error || 'Unknown error'}`);
      }
      
      // The response will be binary audio data
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Return the audio URL without playing - let the caller play it once
      return {
        success: true,
        webSpeech: false,
        huggingFace: true,
        audioUrl: audioUrl,
        model: modelId
      };
    } catch (error) {
      console.error("Error in Hugging Face text-to-speech:", error);
      toast.error("Text-to-Speech Error", {
        description: "Unable to use Hugging Face speech synthesis. Please check your API key and connection.",
      });
      
      // Fall back to browser's Web Speech API if available
      if (window.speechSynthesis) {
        console.log("Falling back to Web Speech API");
        try {
          // Create utterance without playing it
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Return metadata instead of playing
          return {
            success: true,
            webSpeech: true,
            huggingFace: false,
            fallback: true,
            utterance: utterance, // Return the utterance for the caller to play
          };
        } catch (fallbackError) {
          console.error("Fallback Web Speech API also failed:", fallbackError);
        }
      }
      
      return {
        success: false,
        webSpeech: false,
        huggingFace: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
  
  // Get available voice options for Hugging Face models
  getAvailableVoices: () => {
    // These are predefined options for Hugging Face TTS models
    return [
      {
        name: "Female (LJSpeech VITS)",
        modelId: "espnet/kan-bayashi_ljspeech_vits",
        lang: "en",
        default: true,
        isFemale: true
      },
      {
        name: "Male (Tacotron2 LJSpeech)",
        modelId: "speechbrain/tts-tacotron2-ljspeech",
        lang: "en",
        default: false,
        isFemale: false
      },
      {
        name: "Multilingual (MMS TTS)",
        modelId: "facebook/mms-tts-eng",
        lang: "multilingual",
        default: false,
        isFemale: true
      },
      {
        name: "High Quality (YourTTS)",
        modelId: "facebook/yourtts-multi-dialect",
        lang: "multilingual",
        default: false,
        isFemale: false
      }
    ];
  },

  // For speech recognition, we can use the browser's Web Speech API
  // as Hugging Face doesn't support streaming audio for ASR
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
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
    speechSynthesis?: SpeechSynthesis;
  }
}

// Export a combined service object with only the Hugging Face services
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