import { toast } from 'sonner';

// Assessment data types
interface AssessmentFactor {
  id: string;
  name: string;
  description: string;
  value: number;
  icon?: React.ReactNode; // Optional since we don't pass it in router state
  color: string;
}

interface AnalysisData {
  summary: string;
  strengths: Array<{ title: string; description: string }>;
  concernAreas: Array<{ title: string; description: string }>;
  recommendations: Array<{ title: string; description: string }>;
  professionalAdvice: string;
  overallStatus: 'excellent' | 'good' | 'moderate' | 'concerning';
  overallScore?: number;
  severity?: string;
}

interface AssessmentData {
  factors: AssessmentFactor[];
  analysis: AnalysisData;
  timestamp: string;
}

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
  console.log('🚀 Making Groq API call');
  console.log(`📝 Model: ${model}`);
  console.log(`💬 Messages count: ${messages.length}`);
  
  const payload = { messages, model };
  console.log('📦 Request payload:', payload);

  // Detect environment and use appropriate endpoint
  const isDevelopment = import.meta.env.DEV;
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  let url: string;
  let headers: HeadersInit;
  
  if (isDevelopment) {
    // Development: use Vite proxy
    url = '/groq/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
    };
    console.log('🔧 Development mode: using Vite proxy');
  } else {
    // Production: call Groq API directly
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    console.log('🚀 Production mode: calling Groq API directly');
    
    if (!apiKey) {
      throw new Error('VITE_GROQ_API_KEY is not configured for production');
    }
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  console.log(`📊 Response status: ${resp.status} ${resp.statusText}`);
  
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('❌ API Error:', resp.status, txt);
    throw new Error(`Groq API error ${resp.status}: ${txt}`);
  }

  // Check if response has content before parsing
  const responseText = await resp.text();
  console.log('📄 Response length:', responseText.length);
  
  if (!responseText.trim()) {
    throw new Error('Empty response from Groq API');
  }

  try {
    const result = JSON.parse(responseText);
    console.log('✅ Groq API call successful');
    return result;
  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError);
    console.error('📄 Response text:', responseText);
    throw new Error(`Failed to parse Groq API response: ${parseError}`);
  }
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
 * Image Analysis Service using Groq Vision Model
 */
export const imageAnalysisService = {
  analyzeImageMood: async (imageInput: Blob | File | string) => {
    try {
      console.log('🖼️ Starting mood analysis with Groq Vision API');
      
      let imageUrl: string;
      
      // Convert image to base64 data URL if it's a file/blob
      if (imageInput instanceof File || imageInput instanceof Blob) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageInput);
        });
      } else {
        imageUrl = imageInput;
      }
      
      // Detect environment and use appropriate endpoint
      const isDevelopment = import.meta.env.DEV;
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      let url: string;
      let headers: HeadersInit;
      
      if (isDevelopment) {
        // Development: use Vite proxy
        url = '/groq/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
        };
        console.log('🔧 Development mode: using Vite proxy for vision analysis');
      } else {
        // Production: call Groq API directly
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        };
        console.log('🚀 Production mode: calling Groq Vision API directly');
        
        if (!apiKey) {
          throw new Error('VITE_GROQ_API_KEY is not configured for production');
        }
      }

      const payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.3,
        max_completion_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image to understand the person's emotional state. Provide insights that could subtly inform a mental health conversation:

1. Overall emotional tone (e.g., appears calm, seems stressed, looks tired, appears energetic)
2. Facial expression cues (subtle indicators of mood)
3. Body language or posture if visible
4. Energy level indicators

Keep your analysis brief (1-2 sentences) and focused on observable emotional indicators that could help tailor supportive responses. Avoid definitive judgments - use phrases like "appears," "seems," or "suggests."

Example: "The person appears somewhat tired with a gentle expression, suggesting they may benefit from supportive, calm conversation rather than high-energy encouragement."`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      };

      console.log('📦 Vision Request payload model:', payload.model);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('📊 Vision Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vision API error:', errorText);
        throw new Error(`Vision API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Vision analysis completed');

      return {
        success: true,
        moodAnalysis: result.choices[0].message.content,
        metadata: {
          model: payload.model,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error in mood analysis:', error);
      
      // Fallback to a general response
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        moodAnalysis: "I'm unable to analyze the image at the moment. Please describe how you're feeling, and I'll help you work through your emotions.",
        metadata: {
          fallback: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  },
  
  // Keep the old method for compatibility but make it use the new vision approach
  analyzeImageSentiment: async (imageInput: Blob | File | string) => {
    return await imageAnalysisService.analyzeImageMood(imageInput);
  }
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
  startConversation: async (assessmentData?: AssessmentData) => {
    try {
      // Build context from assessment data if available
      let contextMessage = "Hi";
      let systemPrompt = "You are a supportive mental health assistant. Be warm, empathetic, and conversational. Always mention that you're not a replacement for professional help.";
      
      if (assessmentData) {
        console.log('Using assessment data for context:', assessmentData);
        
        // Extract assessment information
        const factors = assessmentData.factors || [];
        const analysis = assessmentData.analysis;
        
        // Create context about the user's assessment
        let assessmentContext = "";
        if (factors.length > 0) {
          const factorScores = factors.map((f: AssessmentFactor) => `${f.name}: ${f.value}/10`).join(", ");
          assessmentContext += `The user recently completed a mental health assessment with scores: ${factorScores}. `;
        }
        
        if (analysis) {
          if (analysis.overallScore) {
            assessmentContext += `Their overall mental health score was ${analysis.overallScore}/10. `;
          }
          if (analysis.overallStatus) {
            assessmentContext += `Overall status: ${analysis.overallStatus}. `;
          }
          if (analysis.recommendations && analysis.recommendations.length > 0) {
            const topRecommendations = analysis.recommendations.slice(0, 2).map(r => r.title).join(", ");
            assessmentContext += `Key recommendations include: ${topRecommendations}. `;
          }
        }
        
        if (assessmentContext) {
          systemPrompt += ` ${assessmentContext}Use this context to provide personalized support, but don't immediately reference the assessment unless relevant to the conversation.`;
          contextMessage = "Hi, I just completed my mental health assessment and would like to talk.";
        }
      }

      // Use Groq Llama API
      const chatCompletion = await callGroqProxy([
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: contextMessage
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
          console.log('🖼️ Image provided, analyzing mood...');
          
          // Use the new mood analysis feature
          const moodResult = await imageAnalysisService.analyzeImageMood(userImage);
          
          if (moodResult.success) {
            console.log('✅ Mood analysis successful');
            
            // Store the image for reference 
            imageUrl = URL.createObjectURL(userImage);
            
            // Add the mood analysis to the conversation context
            imageAnalysis = {
              moodAnalysis: moodResult.moodAnalysis,
              sentiment: moodResult.moodAnalysis, // For compatibility
              visionAnalysis: {
                description: { captions: [{ text: "a photo shared for mood analysis" }] }
              }
            };
            
            // Enhance the last message with mood context (but don't change the user's text)
            const lastMessage = enhancedMessages[enhancedMessages.length - 1];
            if (lastMessage && lastMessage.role === 'user') {
              // Add mood context as a system message before the user's message
              enhancedMessages.splice(-1, 0, {
                role: "system",
                content: `[Visual Context] From the shared photo: ${moodResult.moodAnalysis}. Use this as subtle context (5-10% weight) to inform your response tone and approach. Don't explicitly mention the visual analysis unless directly relevant.`
              });
            }
          } else {
            console.log('⚠️ Mood analysis failed, using fallback');
            imageUrl = URL.createObjectURL(userImage);
            
            // Fallback response
            imageAnalysis = {
              moodAnalysis: "Unable to analyze visual cues clearly, focusing on conversation content.",
              sentiment: null,
              visionAnalysis: {
                description: { captions: [{ text: "a shared photo" }] }
              }
            };
          }
        } catch (imageError) {
          console.error("Error processing image in conversation:", imageError);
          
          // Gentle fallback for image errors
          imageAnalysis = {
            moodAnalysis: "Visual context unavailable, relying on conversation cues.",
            sentiment: null,
            visionAnalysis: {
              description: { captions: [{ text: "a shared photo" }] }
            }
          };
        }
      }
      
      // Use proper chat completion format with message history
      // Just pass the conversation messages directly to the API
      
      console.log("📤 Final messages being sent to Groq:", enhancedMessages);
      console.log("📤 Message count:", enhancedMessages.length);
      
      const chatCompletion = await callGroqProxy([
        { role: "system", content: "You are a supportive mental health assistant. Be natural and conversational. When visual context is provided, let it subtly influence your tone and approach (not the main focus, but a gentle undercurrent). Prioritize the user's words while allowing visual cues to add nuance to your response. Always mention that you're not a replacement for professional help when appropriate." },
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
  },

  // Generate a personalized 10-day mental health improvement plan
  generateImprovementPlan: async (assessmentData: AssessmentData) => {
    try {
      console.log('Generating 10-day plan with assessment data:', assessmentData);
      
      // Build detailed context from assessment
      const factors = assessmentData.factors || [];
      const analysis = assessmentData.analysis;
      
      let contextPrompt = "Create a personalized 10-day mental health improvement plan based on this assessment:\n\n";
      
      // Add factor scores
      if (factors.length > 0) {
        contextPrompt += "Assessment Scores:\n";
        factors.forEach(factor => {
          contextPrompt += `- ${factor.name}: ${factor.value}/10\n`;
        });
        contextPrompt += "\n";
      }
      
      // Add analysis summary
      if (analysis) {
        contextPrompt += `Overall Status: ${analysis.overallStatus}\n`;
        if (analysis.summary) {
          contextPrompt += `Summary: ${analysis.summary}\n`;
        }
        
        if (analysis.concernAreas?.length > 0) {
          contextPrompt += "\nKey Concern Areas:\n";
          analysis.concernAreas.forEach(concern => {
            contextPrompt += `- ${concern.title}: ${concern.description}\n`;
          });
        }
        
        if (analysis.strengths?.length > 0) {
          contextPrompt += "\nStrengths to Build Upon:\n";
          analysis.strengths.forEach(strength => {
            contextPrompt += `- ${strength.title}: ${strength.description}\n`;
          });
        }
      }
      
      contextPrompt += `\nPlease create a structured 10-day mental health improvement plan with:
- Daily activities and exercises specifically targeting the identified concern areas
- Specific goals for each day that build progressively
- Focus on the user's lowest-scoring factors: ${factors.filter(f => f.value <= 5).map(f => f.name).join(', ') || 'general wellness'}
- Building upon existing strengths: ${factors.filter(f => f.value >= 7).map(f => f.name).join(', ') || 'identified positive areas'}
- Practical, actionable steps
- Time estimates for each activity
- Tips for staying motivated

Please format the response as JSON with this exact structure:
{
  "days": [
    {
      "day": 1,
      "title": "Day 1 Title",
      "description": "What this day focuses on",
      "focusArea": "Primary focus area",
      "estimatedTime": "45-60 minutes",
      "activities": [
        {
          "name": "Activity name",
          "description": "What to do",
          "duration": "15 minutes",
          "type": "mindfulness|physical|social|reflection|creative|rest"
        }
      ],
      "goals": ["Goal 1", "Goal 2"],
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}

Make sure each day specifically addresses the user's assessment results and builds toward improvement in their lowest-scoring areas.`;

      const chatCompletion = await callGroqProxy([
        { 
          role: "system", 
          content: "You are an expert mental health coach who creates personalized, evidence-based improvement plans. Always respond with valid JSON in the exact format requested. Focus on practical, achievable daily activities that build positive mental health habits based on the user's specific assessment results." 
        },
        { role: "user", content: contextPrompt }
      ]);

      const planContent = chatCompletion.choices[0].message.content;
      
      return {
        plan: planContent,
        rawResponse: chatCompletion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error generating improvement plan:", error);
      
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('529'))) {
        toast.error("Service Busy", {
          description: "The plan generation service is currently busy. Please try again in a moment.",
        });
      } else {
        toast.error("Plan Generation Error", {
          description: "Failed to generate your improvement plan. Please try again.",
        });
      }
      throw error;
    }
  }
};

/**
 * Speech Service using Groq's TTS API and browser Web Speech API
 */
export const speechService = {
  textToSpeech: async (text: string, voice: string = "Arista-PlayAI") => {
    console.log('🎤 Starting TTS with Groq API');
    console.log('📝 Text length:', text.length);
    console.log('🗣️ Voice:', voice);
    
    try {
      // Detect environment and use appropriate endpoint
      const isDevelopment = import.meta.env.DEV;
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      let url: string;
      let headers: HeadersInit;
      
      if (isDevelopment) {
        // Development: use Vite proxy
        url = '/groq/v1/audio/speech';
        headers = {
          'Content-Type': 'application/json',
        };
        console.log('🔧 Development mode: using Vite proxy for TTS');
      } else {
        // Production: call Groq API directly
        url = 'https://api.groq.com/openai/v1/audio/speech';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        };
        console.log('🚀 Production mode: calling Groq TTS API directly');
        
        if (!apiKey) {
          throw new Error('VITE_GROQ_API_KEY is not configured for production');
        }
      }

      const payload = {
        model: "playai-tts",
        voice: voice,
        input: text,
        response_format: "mp3"
      };

      console.log('📦 TTS Request payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log('📊 TTS Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TTS API Error:', response.status, errorText);
        
        // Fallback to Web Speech API
        console.log('🔄 Falling back to Web Speech API');
        return await speechService.fallbackToWebSpeech(text);
      }

      // Get audio data as blob
      const audioBlob = await response.blob();
      console.log('🎵 Audio blob size:', audioBlob.size);

      // Create audio URL
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return {
        success: true,
        groqTTS: true,
        audio,
        audioUrl,
        cleanup: () => URL.revokeObjectURL(audioUrl)
      };

    } catch (error) {
      console.error('❌ Groq TTS failed:', error);
      console.log('🔄 Falling back to Web Speech API');
      return await speechService.fallbackToWebSpeech(text);
    }
  },

  // Fallback to Web Speech API
  fallbackToWebSpeech: async (text: string) => {
    if (window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        return {
          success: true,
          webSpeech: true,
          utterance,
          speak: () => window.speechSynthesis.speak(utterance),
          stop: () => window.speechSynthesis.cancel()
        };
      } catch (error) {
        console.error("Web Speech synthesis failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
    return { success: false, error: "No TTS options available" };
  },

  // Get available voices (Groq voices + Web Speech voices)
  getAvailableVoices: async () => {
    const groqVoices = [
      { id: "Arista-PlayAI", name: "Arista (Female, PlayAI)", provider: "groq", gender: "female" },
      { id: "Basil-PlayAI", name: "Basil (Male, PlayAI)", provider: "groq", gender: "male" }
    ];

    const webVoices = window.speechSynthesis ? 
      window.speechSynthesis.getVoices().map(voice => ({
        id: voice.name,
        name: voice.name,
        provider: "web",
        lang: voice.lang
      })) : [];

    return {
      groq: groqVoices,
      web: webVoices,
      all: [...groqVoices, ...webVoices]
    };
  },

  // Helper function to get voice by gender preference
  getVoiceByGender: (gender: 'male' | 'female' = 'female') => {
    return gender === 'female' ? 'Arista-PlayAI' : 'Basil-PlayAI';
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