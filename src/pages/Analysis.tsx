import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { Brain, HeartPulse, ArrowRight, Moon, Sun, Battery, Coffee, Users, Home, Dumbbell, MessageSquare, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { azureAIServices } from "@/services/azure-ai";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Stethoscope, 
  ArrowUpCircle,
  ArrowDownCircle, 
  Sparkles,
  Heart,
  ThumbsUp,
  Flame,
  Award,
  Frown,
  BadgeAlert,
  Dumbbell as DumbbellIcon 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import Navbar from "@/components/navbar";

type AssessmentFactor = {
  id: string;
  name: string;
  description: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

type AnalysisData = {
  summary: string;
  strengths: Array<{ title: string; description: string }>;
  concernAreas: Array<{ title: string; description: string }>;
  recommendations: Array<{ title: string; description: string }>;
  professionalAdvice: string;
  overallStatus: 'excellent' | 'good' | 'moderate' | 'concerning';
};

// Add a new type for more detailed analysis inferences
type EnhancedAnalysisData = AnalysisData & {
  scoreInterpretation: string;
  patternInsights: string;
  strengthsImpact: string;
  concernsImpact: string;
  balanceAnalysis: string;
  recommendationRationale: Record<string, string>;  // Maps recommendation title to rationale
  longTermOutlook: string;
};

const Analysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Assessment factors with default values
  const [factors, setFactors] = useState<AssessmentFactor[]>([
    { 
      id: "mood", 
      name: "Overall Mood", 
      description: "How would you rate your general mood today?", 
      value: 5, 
      icon: <Brain className="h-5 w-5" />,
      color: "#60a5fa"
    },
    { 
      id: "anxiety", 
      name: "Anxiety Level", 
      description: "How anxious or worried have you been feeling?", 
      value: 5, 
      icon: <HeartPulse className="h-5 w-5" />,
      color: "#f87171"
    },
    { 
      id: "sleep", 
      name: "Sleep Quality", 
      description: "How well have you been sleeping recently?", 
      value: 5, 
      icon: <Moon className="h-5 w-5" />,
      color: "#a78bfa"
    },
    { 
      id: "energy", 
      name: "Energy Level", 
      description: "How would you rate your energy level?", 
      value: 5, 
      icon: <Battery className="h-5 w-5" />,
      color: "#34d399"
    },
    { 
      id: "focus", 
      name: "Concentration", 
      description: "How well can you focus on tasks?", 
      value: 5, 
      icon: <Coffee className="h-5 w-5" />,
      color: "#fbbf24"
    },
    { 
      id: "social", 
      name: "Social Connection", 
      description: "How connected do you feel to others?", 
      value: 5, 
      icon: <Users className="h-5 w-5" />,
      color: "#ec4899"
    },
    { 
      id: "environment", 
      name: "Living Environment", 
      description: "How satisfied are you with your living environment?", 
      value: 5, 
      icon: <Home className="h-5 w-5" />,
      color: "#14b8a6"
    },
    { 
      id: "physical", 
      name: "Physical Activity", 
      description: "How physically active have you been?", 
      value: 5, 
      icon: <Dumbbell className="h-5 w-5" />,
      color: "#f97316"
    }
  ]);
  
  const [step, setStep] = useState<'assessment' | 'results'>('assessment');
  const [overallScore, setOverallScore] = useState(0);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedAnalysisData | null>(null);
  
  // Calculate overall score whenever factors change
  useEffect(() => {
    const total = factors.reduce((sum, factor) => sum + factor.value, 0);
    const avg = total / factors.length;
    setOverallScore(Math.round(avg * 10));
  }, [factors]);
  
  // Update a specific factor's value
  const updateFactorValue = (id: string, newValue: number[]) => {
    setFactors(factors.map(factor => 
      factor.id === id ? { ...factor, value: newValue[0] } : factor
    ));
  };
  
  // Enhanced analysis parser with more detailed inferences
  const parseAnalysisResponse = (text: string): EnhancedAnalysisData => {
    // Default structure (from existing code)
    const defaultAnalysis: AnalysisData = {
      summary: "Based on your assessment, here's an overview of your mental wellbeing.",
      strengths: [],
      concernAreas: [],
      recommendations: [],
      professionalAdvice: "Consider consulting with a mental health professional for personalized guidance.",
      overallStatus: overallScore >= 80 ? 'excellent' : overallScore >= 65 ? 'good' : overallScore >= 50 ? 'moderate' : 'concerning'
    };
    
    // Enhanced analysis data with inferences
    const enhancedData: EnhancedAnalysisData = {
      ...defaultAnalysis,
      scoreInterpretation: "",
      patternInsights: "",
      strengthsImpact: "",
      concernsImpact: "",
      balanceAnalysis: "",
      recommendationRationale: {},
      longTermOutlook: ""
    };
    
    try {
      // Find highest and lowest rated factors
      const sortedFactors = [...factors].sort((a, b) => b.value - a.value);
      const highestFactors = sortedFactors.slice(0, 3).filter(f => f.value >= 7);
      const lowestFactors = sortedFactors.reverse().slice(0, 3).filter(f => f.value <= 6);
      
      // Existing logic for adding strengths and concerns...
      highestFactors.forEach(factor => {
        defaultAnalysis.strengths.push({
          title: factor.name,
          description: `You rated your ${factor.name.toLowerCase()} as ${factor.value}/10, indicating this is an area of strength.`
        });
      });
      
      lowestFactors.forEach(factor => {
        defaultAnalysis.concernAreas.push({
          title: factor.name,
          description: `You rated your ${factor.name.toLowerCase()} as ${factor.value}/10, suggesting this area may need attention.`
        });
      });
      
      if (lowestFactors.some(f => f.id === "sleep")) {
        defaultAnalysis.recommendations.push({
          title: "Improve Sleep Habits",
          description: "Establish a regular sleep schedule, create a restful environment, and limit screen time before bed."
        });
      }
      
      if (lowestFactors.some(f => f.id === "physical")) {
        defaultAnalysis.recommendations.push({
          title: "Increase Physical Activity",
          description: "Start with short walks or gentle exercise for 15-30 minutes daily to boost mood and energy levels."
        });
      }
      
      if (lowestFactors.some(f => f.id === "social")) {
        defaultAnalysis.recommendations.push({
          title: "Strengthen Social Connections",
          description: "Reach out to friends or family, join community groups, or consider volunteering to enhance social wellbeing."
        });
      }
      
      if (lowestFactors.some(f => f.id === "anxiety")) {
        defaultAnalysis.recommendations.push({
          title: "Practice Mindfulness",
          description: "Try deep breathing exercises, meditation, or guided relaxation techniques to reduce anxiety."
        });
      }
      
      // New inference logic for score interpretation
      if (overallScore >= 80) {
        enhancedData.scoreInterpretation = "Your overall score reflects a robust state of mental wellbeing. This suggests you have developed effective coping mechanisms and healthy lifestyle habits that support your mental health.";
      } else if (overallScore >= 65) {
        enhancedData.scoreInterpretation = "Your overall score indicates a generally positive mental state with some areas for improvement. The balance in your scores suggests you're maintaining good mental health practices in most areas.";
      } else if (overallScore >= 50) {
        enhancedData.scoreInterpretation = "Your overall score suggests a moderate level of mental wellbeing with several areas that could benefit from attention. This is a common profile that responds well to targeted improvements.";
      } else {
        enhancedData.scoreInterpretation = "Your current scores indicate several challenges to your mental wellbeing. This pattern often suggests that addressing a few key areas could have significant positive impacts across multiple dimensions.";
      }
      
      // Pattern insights based on high/low disparities
      const disparity = Math.max(...factors.map(f => f.value)) - Math.min(...factors.map(f => f.value));
      if (disparity >= 6) {
        enhancedData.patternInsights = "There's a significant disparity between your highest and lowest-rated areas. This imbalance suggests that focusing on your lower-rated aspects may create a more harmonious mental state overall.";
      } else if (disparity >= 3) {
        enhancedData.patternInsights = "Your assessment shows moderate variation across different areas. This pattern is common and suggests that you have both solid foundations and clear opportunities for growth.";
      } else {
        enhancedData.patternInsights = "Your ratings are relatively consistent across different aspects of mental health. This balance can be a strength, though it may also indicate a tendency to view different areas of life through a similar lens.";
      }
      
      // Analyze the strengths more deeply
      if (highestFactors.length > 0) {
        const strengthAreas = highestFactors.map(f => f.name.toLowerCase()).join(", ");
        enhancedData.strengthsImpact = `Your strengths in ${strengthAreas} provide valuable resources you can leverage when addressing other aspects of your wellbeing. Research shows that building on existing strengths often leads to faster improvements than focusing solely on weaknesses.`;
      } else {
        enhancedData.strengthsImpact = "Even though no areas scored exceptionally high, identifying and nurturing relative strengths is an effective strategy for improving overall wellbeing. Consider what activities make you feel most capable and engaged.";
      }
      
      // Analyze the concerns more deeply
      if (lowestFactors.length > 0) {
        const concernAreas = lowestFactors.map(f => f.name.toLowerCase()).join(", ");
        enhancedData.concernsImpact = `The lower scores in ${concernAreas} may be creating a ripple effect, potentially impacting other aspects of your mental health. These areas often respond well to targeted interventions and gradual, consistent effort.`;
      } else {
        enhancedData.concernsImpact = "While you don't have severely low scores, addressing the relatively lower-rated areas can help elevate your overall mental wellbeing to an even better state.";
      }
      
      // Analyze the balance between different areas
      if (factors.some(f => f.id === "physical") && factors.some(f => f.id === "mood")) {
        const physical = factors.find(f => f.id === "physical")!.value;
        const mood = factors.find(f => f.id === "mood")!.value;
        if (physical > mood + 2) {
          enhancedData.balanceAnalysis = "Your physical wellbeing rates higher than your mood. Research suggests that while physical activity benefits mental health, emotional wellness may need direct attention through practices like mindfulness or social connection.";
        } else if (mood > physical + 2) {
          enhancedData.balanceAnalysis = "Your mood rates higher than your physical activity level. This pattern suggests you may benefit from incorporating more movement into your routine, as physical activity has been shown to sustain emotional wellbeing over time.";
        }
      }
      
      if (factors.some(f => f.id === "social") && factors.some(f => f.id === "environment")) {
        const social = factors.find(f => f.id === "social")!.value;
        const environment = factors.find(f => f.id === "environment")!.value;
        if (social < 5 && environment < 5) {
          enhancedData.balanceAnalysis += " Both social connection and environment show lower scores. These external factors often interact, and improvements in one area may positively influence the other.";
        }
      }
      
      // Create recommendation rationales
      if (lowestFactors.some(f => f.id === "sleep")) {
        enhancedData.recommendationRationale["Improve Sleep Habits"] = "Sleep quality affects nearly every aspect of mental health. Research shows that consistent sleep patterns regulate mood, improve concentration, and reduce anxiety.";
      }
      
      if (lowestFactors.some(f => f.id === "physical")) {
        enhancedData.recommendationRationale["Increase Physical Activity"] = "Physical activity releases endorphins that reduce stress and improve mood. Even modest increases in activity can have significant benefits for mental wellbeing.";
      }
      
      if (lowestFactors.some(f => f.id === "social")) {
        enhancedData.recommendationRationale["Strengthen Social Connections"] = "Humans are social beings. Strong connections provide emotional support, reduce feelings of isolation, and create a sense of belonging that buffers against stress.";
      }
      
      if (lowestFactors.some(f => f.id === "anxiety")) {
        enhancedData.recommendationRationale["Practice Mindfulness"] = "Mindfulness reduces rumination and helps break anxiety cycles by bringing attention to the present moment rather than worrying about the future.";
      }
      
      // Long-term outlook based on current assessment
      if (overallScore >= 70) {
        enhancedData.longTermOutlook = "Your current profile suggests a positive trajectory for mental wellbeing. With continued attention to the recommended areas, you're likely to maintain or further improve your mental health.";
      } else if (overallScore >= 50) {
        enhancedData.longTermOutlook = "With targeted focus on the areas highlighted in this assessment, you have good potential for significant improvements in your overall mental wellbeing over the next few months.";
      } else {
        enhancedData.longTermOutlook = "While your current scores indicate challenges, many people with similar profiles experience substantial improvements with consistent self-care and appropriate support. Consider discussing these results with a mental health professional.";
      }
      
      // If we have the AI-generated text, try to extract better information from it
      // ...existing AI parsing code...
      
      return enhancedData;
    } catch (error) {
      console.error("Error parsing analysis:", error);
      return enhancedData;
    }
  };
  
  // Generate mental health analysis based on the assessment
  const generateAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Create a prompt for the analysis
      const prompt = `
        I've completed a mental health self-assessment with the following scores (on a scale of 1-10):
        
        ${factors.map(f => `- ${f.name}: ${f.value}/10`).join('\n')}
        
        Overall score: ${overallScore}/100
        
        Please provide a detailed analysis of these results, including:
        1. A summary of my current mental wellbeing
        2. Areas of strength (highest scores)
        3. Areas that may need attention (lowest scores)
        4. 3-4 practical suggestions for improving my mental health based on these results
        5. Whether I should consider speaking with a mental health professional
        
        Keep your response compassionate, supportive, and focused on actionable steps.
      `;
      
  // Use the Groq Llama model to generate the analysis
  const response = await azureAIServices.gpt.chat(prompt, "llama-3.3-70b-versatile");
      
      if (response && response.choices && response.choices.length > 0) {
        const analysisText = response.choices[0].message.content;
        setAnalysis(analysisText);
        
        // Parse the analysis into structured data and enhanced insights
        const parsedData = parseAnalysisResponse(analysisText);
        setAnalysisData(parsedData);
        setEnhancedAnalysis(parsedData);
      } else {
        throw new Error("No valid response from analysis service");
      }
      
      // Complete the progress bar
      setProgress(100);
      
      // Move to results step
      setTimeout(() => {
        setStep('results');
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your responses. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      clearInterval(interval);
    }
  };
  
  // Data for bar chart
  const barChartData = factors.map(factor => ({
    name: factor.name,
    value: factor.value,
    color: factor.color
  }));
  
  // Data for radar chart (same data, different format)
  const radarChartData = factors.map(factor => ({
    subject: factor.name,
    A: factor.value,
    fullMark: 10,
  }));
  
  // Convert analysis text to paragraphs
  const analysisParagraphs = analysis.split('\n\n').filter(p => p.trim() !== '');
  
  // Helper function to get a suitable icon for a recommendation
  const getRecommendationIcon = (title: string) => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('sleep')) return <Moon className="h-5 w-5" />;
    if (lowercaseTitle.includes('physical') || lowercaseTitle.includes('exercise') || lowercaseTitle.includes('activity')) 
      return <DumbbellIcon className="h-5 w-5" />;
    if (lowercaseTitle.includes('social') || lowercaseTitle.includes('connect')) 
      return <Users className="h-5 w-5" />;
    if (lowercaseTitle.includes('mindful') || lowercaseTitle.includes('meditation')) 
      return <Brain className="h-5 w-5" />;
    if (lowercaseTitle.includes('anxiety') || lowercaseTitle.includes('stress')) 
      return <HeartPulse className="h-5 w-5" />;
    return <Lightbulb className="h-5 w-5" />;
  };
  
  // Generate 10-day improvement plan
  const generateImprovementPlan = async () => {
    if (!analysisData) {
      toast({
        title: "Error",
        description: "Please complete the assessment first.",
        variant: "destructive",
      });
      return;
    }

    // Create serializable assessment data
    const serializableFactors = factors.map(factor => ({
      id: factor.id,
      name: factor.name,
      description: factor.description,
      value: factor.value,
      color: factor.color
    }));

    const assessmentData = {
      factors: serializableFactors,
      analysis: analysisData,
      timestamp: new Date().toISOString()
    };

    // Navigate to the improvement plan page with assessment data
    navigate('/improvement-plan', { 
      state: { 
        assessmentData: assessmentData
      }
    });
  };
  
  // Get color scheme based on overall status
  const getStatusColorScheme = () => {
    if (!analysisData) return { bg: 'bg-blue-50', text: 'text-blue-800', dark: 'dark:bg-blue-900/20 dark:text-blue-300' };
    
    switch (analysisData.overallStatus) {
      case 'excellent':
        return { bg: 'bg-green-50', text: 'text-green-800', dark: 'dark:bg-green-900/20 dark:text-green-300' };
      case 'good':
        return { bg: 'bg-blue-50', text: 'text-blue-800', dark: 'dark:bg-blue-900/20 dark:text-blue-300' };
      case 'moderate':
        return { bg: 'bg-yellow-50', text: 'text-yellow-800', dark: 'dark:bg-yellow-900/20 dark:text-yellow-300' };
      case 'concerning':
        return { bg: 'bg-orange-50', text: 'text-orange-800', dark: 'dark:bg-orange-900/20 dark:text-orange-300' };
      default:
        return { bg: 'bg-blue-50', text: 'text-blue-800', dark: 'dark:bg-blue-900/20 dark:text-blue-300' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Add Navbar */}
      <Navbar />
      
      <div className="pt-20 py-12 px-4"> {/* Added padding-top to account for fixed navbar */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-7xl font-bold mb-4 text-gray-900 dark:text-gray-50">सह-<span className="text-yellow-500">AI</span>-यक</h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              Because mental health matters—<span className="text-yellow-500 font-bold">let's talk!</span>
            </p>
            
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-50 flex items-center justify-center gap-2">
              <Brain className="h-8 w-8 text-blue-500" />
              Mental Health Assessment
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {step === 'assessment' 
                ? "Rate each aspect of your mental wellbeing to receive a personalized analysis and recommendations."
                : "Your personalized mental health assessment and recommendations."}
            </p>
          </div>
          
          {step === 'assessment' ? (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle>Mental Wellbeing Assessment</CardTitle>
                <CardDescription>
                  Move the sliders to rate how you feel about each aspect from 1 (poor) to 10 (excellent)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {factors.map((factor) => (
                  <div key={factor.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full" style={{ backgroundColor: `${factor.color}30` }}>
                          {factor.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-medium">{factor.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{factor.description}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: factor.color }}>
                        {factor.value}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[factor.value]}
                      max={10}
                      min={1}
                      step={1}
                      value={[factor.value]}
                      onValueChange={(value) => updateFactorValue(factor.id, value)}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Wellbeing Score</span>
                    <span className="font-bold">{overallScore}/100</span>
                  </div>
                  <Progress value={overallScore} className="h-3" />
                </div>
                <Button 
                  onClick={generateAnalysis} 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing ({progress}%)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Generate Analysis Report</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Card - Enhanced with interpretations */}
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Your Mental Wellbeing Score</span>
                    <span className={`text-2xl font-bold ${
                      overallScore >= 80 ? 'text-green-500' : 
                      overallScore >= 60 ? 'text-blue-500' : 
                      overallScore >= 40 ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {overallScore}/100
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Based on your self-assessment of 8 key mental health factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Radar Chart */}
                  <div className="h-[300px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="70%" data={radarChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar name="Your Rating" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Enhanced insights about the score */}
                  {enhancedAnalysis && (
                    <div className="space-y-4 mt-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span>Score Interpretation</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{enhancedAnalysis.scoreInterpretation}</p>
                      </div>
                      
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>Pattern Insights</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{enhancedAnalysis.patternInsights}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Analysis Card */}
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Personalized Analysis</CardTitle>
                  <CardDescription>
                    A detailed assessment of your mental wellbeing based on your responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Factor Breakdown - Keep the design we implemented in the last update */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Factor Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {factors.sort((a, b) => b.value - a.value).map((factor) => (
                        <div 
                          key={factor.id} 
                          className="border rounded-lg p-4 overflow-hidden relative"
                          style={{ backgroundColor: `${factor.color}10` }}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div 
                              className="p-1.5 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: `${factor.color}30` }}
                            >
                              {factor.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{factor.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{factor.description}</p>
                            </div>
                            <span 
                              className="ml-auto text-xl font-bold" 
                              style={{ color: factor.color }}
                            >
                              {factor.value}/10
                            </span>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-grow rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all" 
                                  style={{ 
                                    width: `${factor.value * 10}%`, 
                                    backgroundColor: factor.color
                                  }} 
                                />
                              </div>
                              <div className="text-xs font-medium" style={{ color: factor.color }}>
                                {factor.value >= 8 ? 'Excellent' : 
                                 factor.value >= 6 ? 'Good' : 
                                 factor.value >= 4 ? 'Fair' : 
                                 'Needs Attention'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Decorative element */}
                          <div 
                            className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10"
                            style={{ backgroundColor: factor.color }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Balance Analysis - New section showing relationships between factors */}
                    {enhancedAnalysis && enhancedAnalysis.balanceAnalysis && (
                      <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/20">
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-2">
                          <Flame className="h-4 w-4" />
                          <span>Balance Analysis</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{enhancedAnalysis.balanceAnalysis}</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Generated Analysis Overview */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Analysis Overview</h3>
                    
                    {enhancedAnalysis ? (
                      <div className="space-y-6">
                        {/* Summary Card */}
                        <div className={`p-4 rounded-lg border ${getStatusColorScheme().bg} ${getStatusColorScheme().text} ${getStatusColorScheme().dark}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-full bg-white/80 dark:bg-gray-800/50 ${getStatusColorScheme().text}`}>
                              {enhancedAnalysis.overallStatus === 'excellent' ? (
                                <Award className="h-5 w-5" />
                              ) : enhancedAnalysis.overallStatus === 'good' ? (
                                <ThumbsUp className="h-5 w-5" />
                              ) : enhancedAnalysis.overallStatus === 'moderate' ? (
                                <Heart className="h-5 w-5" />
                              ) : (
                                <Frown className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Summary</h4>
                              <p className="text-sm">{enhancedAnalysis.summary}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Strengths Section - Enhanced with impact analysis */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2 text-green-600 dark:text-green-400">
                              <ArrowUpCircle className="h-5 w-5" />
                              <span>Areas of Strength</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {enhancedAnalysis.strengths.map((strength, index) => (
                                <div key={`strength-${index}`} className="border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                                      <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm mb-1">{strength.title}</h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-300">{strength.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Strengths Impact Analysis */}
                            <div className="border-t pt-4 mt-2">
                              <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                                  <Sparkles className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm mb-1">How These Strengths Help You</h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">{enhancedAnalysis.strengthsImpact}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Areas of Concern Section - Enhanced with impact analysis */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <ArrowDownCircle className="h-5 w-5" />
                              <span>Areas for Improvement</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {enhancedAnalysis.concernAreas.map((concern, index) => (
                                <div key={`concern-${index}`} className="border rounded-lg p-4 bg-amber-50/50 dark:bg-amber-900/10">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                                      <AlertCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm mb-1">{concern.title}</h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-300">{concern.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Concerns Impact Analysis */}
                            <div className="border-t pt-4 mt-2">
                              <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                                  <Lightbulb className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Why These Areas Matter</h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">{enhancedAnalysis.concernsImpact}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Recommendations Section - Enhanced with rationales */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Sparkles className="h-5 w-5" />
                              <span>Recommendations</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {enhancedAnalysis.recommendations.map((recommendation, index) => (
                                <div key={`recommendation-${index}`} className="border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                      {getRecommendationIcon(recommendation.title)}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-300">{recommendation.description}</p>
                                      
                                      {/* Add rationale if available */}
                                      {enhancedAnalysis.recommendationRationale[recommendation.title] && (
                                        <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800/20">
                                          <p className="text-xs italic text-blue-600 dark:text-blue-400">
                                            <span className="font-medium">Why this helps: </span>
                                            {enhancedAnalysis.recommendationRationale[recommendation.title]}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Long-Term Outlook - New section */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2 text-teal-600 dark:text-teal-400">
                              <BadgeAlert className="h-5 w-5" />
                              <span>Your Outlook</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="border rounded-lg p-4 bg-teal-50/50 dark:bg-teal-900/10">
                              <p className="text-sm text-gray-600 dark:text-gray-300">{enhancedAnalysis.longTermOutlook}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Professional Advice */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2 text-violet-600 dark:text-violet-400">
                              <Stethoscope className="h-5 w-5" />
                              <span>Professional Guidance</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="border rounded-lg p-4 bg-violet-50/50 dark:bg-violet-900/10">
                              <p className="text-sm">{enhancedAnalysis.professionalAdvice}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-violet-100/50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100">
                                  Find a therapist
                                </Badge>
                                <Badge variant="outline" className="bg-violet-100/50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100">
                                  Mental health hotlines
                                </Badge>
                                <Badge variant="outline" className="bg-violet-100/50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100">
                                  Support groups
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Analysis content is being processed...
                      </p>
                    )}
                  </div>
                </CardContent>
                
                {/* Rest of the CardFooter content (unchanged) */}
                <CardFooter className="flex flex-col gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Continue Your Mental Health Journey</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                      For more personalized support and to discuss your assessment results, chat with our AI mental health assistant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => {
                          // Create serializable version of factors without React icons
                          const serializableFactors = factors.map(factor => ({
                            id: factor.id,
                            name: factor.name,
                            description: factor.description,
                            value: factor.value,
                            color: factor.color
                            // Excluding icon as it's not serializable
                          }));
                          
                          navigate('/chat', { 
                            state: { 
                              assessmentData: {
                                factors: serializableFactors,
                                analysis: analysisData,
                                timestamp: new Date().toISOString()
                              }
                            }
                          });
                        }}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Chat with Assistant</span>
                        </div>
                      </Button>
                      
                      <Button 
                        onClick={generateImprovementPlan}
                        variant="outline"
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Get 10-Day Plan</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setStep('assessment')}
                  >
                    Return to Assessment
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              This assessment is not a diagnostic tool. If you're experiencing severe distress, 
              please contact a mental health professional or emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
