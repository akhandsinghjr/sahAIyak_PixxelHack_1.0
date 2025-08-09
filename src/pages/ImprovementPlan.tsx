import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { azureAIServices } from "@/services/azure-ai";
import Navbar from "@/components/navbar";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target, 
  Brain, 
  Heart, 
  Dumbbell, 
  Moon, 
  Users, 
  Lightbulb,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Sparkles
} from "lucide-react";

interface DayPlan {
  day: number;
  title: string;
  description: string;
  activities: Activity[];
  goals: string[];
  tips: string[];
  estimatedTime: string;
  focusArea: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  type: 'mindfulness' | 'physical' | 'social' | 'reflection' | 'creative' | 'rest';
  completed?: boolean;
}

const ImprovementPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const assessmentData = location.state?.assessmentData;
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [planProgress, setPlanProgress] = useState(0);

  // Activity type icons
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'mindfulness': return <Brain className="h-4 w-4" />;
      case 'physical': return <Dumbbell className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'reflection': return <Lightbulb className="h-4 w-4" />;
      case 'creative': return <Sparkles className="h-4 w-4" />;
      case 'rest': return <Moon className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  // Activity type colors
  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'mindfulness': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'physical': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'social': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'reflection': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'creative': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'rest': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Generate the improvement plan
  useEffect(() => {
    if (!assessmentData) {
      toast({
        title: "No Assessment Data",
        description: "Please complete an assessment first.",
        variant: "destructive",
      });
      navigate('/analysis');
      return;
    }

    generatePlan();
  }, [assessmentData]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const planResponse = await azureAIServices.mentalHealth.generateImprovementPlan(assessmentData);
      
      // Parse the AI response and structure it into day plans
      const structuredPlan = parseAIPlanResponse(planResponse.plan);
      setDayPlans(structuredPlan);
      
      toast({
        title: "Success",
        description: "Your personalized 10-day improvement plan has been generated!",
      });
    } catch (error) {
      console.error('Error generating improvement plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate improvement plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Parse AI response into structured day plans
  const parseAIPlanResponse = (aiResponse: string): DayPlan[] => {
    try {
      console.log('Parsing AI response:', aiResponse);
      
      // Try to extract JSON from the AI response
      let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      let planData;
      
      if (jsonMatch) {
        try {
          planData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn('Failed to parse JSON from AI response, using fallback');
          planData = null;
        }
      }
      
      // If we have valid JSON structure from AI, use it
      if (planData && planData.days && Array.isArray(planData.days)) {
        console.log('Using AI-generated plan structure');
        return planData.days.map((day: any) => ({
          day: day.day,
          title: day.title || `Day ${day.day}`,
          description: day.description || '',
          activities: (day.activities || []).map((activity: any, index: number) => ({
            id: `${day.day}-${index}`,
            name: activity.name || 'Activity',
            description: activity.description || '',
            duration: activity.duration || '15 minutes',
            type: activity.type || 'reflection'
          })),
          goals: day.goals || [],
          tips: day.tips || [],
          estimatedTime: day.estimatedTime || '45-60 minutes',
          focusArea: day.focusArea || 'General Wellness'
        }));
      }
      
      // Fallback: Generate structure based on assessment data if AI response isn't structured
      console.log('Using assessment-based fallback structure');
      return generateFallbackPlan();
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return generateFallbackPlan();
    }
  };

  // Fallback plan generation based on assessment data
  const generateFallbackPlan = (): DayPlan[] => {
    const days: DayPlan[] = [];
    const factors = assessmentData?.factors || [];
    const lowScoreFactors = factors.filter((f: any) => f.value <= 5);
    const mediumScoreFactors = factors.filter((f: any) => f.value > 5 && f.value <= 7);
    const highScoreFactors = factors.filter((f: any) => f.value >= 7);

    for (let i = 1; i <= 10; i++) {
      const day: DayPlan = {
        day: i,
        title: getDayTitle(i, lowScoreFactors),
        description: getDayDescription(i, lowScoreFactors, mediumScoreFactors),
        activities: getDayActivities(i, lowScoreFactors),
        goals: getDayGoals(i, lowScoreFactors),
        tips: getDayTips(i),
        estimatedTime: "45-60 minutes",
        focusArea: getDayFocusArea(i, lowScoreFactors)
      };
      days.push(day);
    }

    return days;
  };

  // Helper functions for generating day content (updated to use assessment data)
  const getDayTitle = (day: number, lowFactors: any[] = []): string => {
    const primaryConcern = lowFactors[0]?.name || 'Overall Wellness';
    
    const personalizedTitles = [
      `Foundation & Understanding Your ${primaryConcern}`,
      `Building Awareness Around ${primaryConcern}`,
      `Taking Action on ${lowFactors[1]?.name || 'Physical Wellness'}`,
      `Strengthening ${lowFactors[2]?.name || 'Social Connection'}`,
      `Managing ${primaryConcern} Challenges`,
      `Creative Approaches to ${primaryConcern}`,
      `Rest & Recovery for ${primaryConcern}`,
      `Emotional Skills for ${primaryConcern}`,
      `Building Long-term Resilience`,
      `Integration & Future Planning`
    ];
    
    return personalizedTitles[day - 1] || `Day ${day} - ${primaryConcern} Focus`;
  };

  const getDayDescription = (day: number, lowFactors: any[], mediumFactors: any[]): string => {
    const primaryConcern = lowFactors[0]?.name || 'overall wellness';
    const concernLevel = lowFactors[0]?.value || 5;
    
    if (day === 1) {
      return `Begin your journey by understanding your ${primaryConcern} patterns and establishing a foundation for positive change. Your current ${primaryConcern} level is ${concernLevel}/10.`;
    }
    if (day === 10) {
      return `Consolidate your learnings about ${primaryConcern} and create a sustainable plan for continued growth beyond these 10 days.`;
    }
    
    const focusArea = lowFactors[(day - 2) % lowFactors.length]?.name || primaryConcern;
    return `Continue building positive habits with specific focus on improving your ${focusArea}. Target activities designed to address your current level of ${lowFactors.find(f => f.name === focusArea)?.value || concernLevel}/10.`;
  };

  const getDayActivities = (day: number, lowFactors: any[]): Activity[] => {
    const primaryConcern = lowFactors[0]?.name?.toLowerCase() || 'overall mood';
    const baseActivities: Activity[] = [
      {
        id: `${day}-1`,
        name: "Morning Check-in",
        description: `Start your day by rating your ${primaryConcern} and setting an intention for improvement`,
        duration: "10 minutes",
        type: 'reflection'
      }
    ];

    // Add specific activities based on the primary concern
    if (primaryConcern.includes('mood') || primaryConcern.includes('emotional')) {
      baseActivities.push({
        id: `${day}-2`,
        name: "Mood Regulation Practice",
        description: "Practice deep breathing and mindfulness to regulate emotional responses",
        duration: "15 minutes",
        type: 'mindfulness'
      });
    } else if (primaryConcern.includes('energy') || primaryConcern.includes('physical')) {
      baseActivities.push({
        id: `${day}-2`,
        name: "Energy Building Exercise",
        description: day <= 3 ? "Gentle movement to boost energy levels" : "Moderate exercise to build physical stamina",
        duration: day <= 3 ? "15 minutes" : "25 minutes",
        type: 'physical'
      });
    } else if (primaryConcern.includes('sleep')) {
      baseActivities.push({
        id: `${day}-2`,
        name: "Sleep Hygiene Practice",
        description: "Implement sleep-promoting activities and create a calming environment",
        duration: "20 minutes",
        type: 'rest'
      });
    } else if (primaryConcern.includes('social') || primaryConcern.includes('connection')) {
      baseActivities.push({
        id: `${day}-2`,
        name: "Social Connection Activity",
        description: "Reach out to someone or engage in community activity",
        duration: "20 minutes",
        type: 'social'
      });
    } else {
      baseActivities.push({
        id: `${day}-2`,
        name: "Targeted Wellness Activity",
        description: `Engage in an activity specifically designed to improve your ${primaryConcern}`,
        duration: "20 minutes",
        type: 'mindfulness'
      });
    }

    baseActivities.push({
      id: `${day}-3`,
      name: "Evening Reflection",
      description: `Journal about your progress with ${primaryConcern} and note any improvements or challenges`,
      duration: "15 minutes",
      type: 'reflection'
    });

    // Add variety every few days
    if (day % 3 === 0 && lowFactors.length > 1) {
      const secondaryConcern = lowFactors[1]?.name?.toLowerCase() || 'wellness';
      baseActivities.push({
        id: `${day}-4`,
        name: `${lowFactors[1]?.name} Booster`,
        description: `Additional activity to support your ${secondaryConcern} improvement`,
        duration: "15 minutes",
        type: 'creative'
      });
    }

    return baseActivities;
  };

  const getDayGoals = (day: number, lowFactors: any[] = []): string[] => {
    const primaryConcern = lowFactors[0]?.name || 'overall wellness';
    const concernValue = lowFactors[0]?.value || 5;
    
    const goals = [
      `Work on improving ${primaryConcern} from ${concernValue}/10`,
      "Practice self-compassion throughout the day",
      "Complete all planned activities mindfully"
    ];

    if (day === 1) goals.push(`Establish baseline awareness of your ${primaryConcern}`);
    if (day === 5) goals.push(`Implement at least 2 strategies for ${primaryConcern} improvement`);
    if (day === 10) goals.push(`Create a sustainable plan for continued ${primaryConcern} improvement`);

    return goals;
  };

  const getDayTips = (day: number): string[] => {
    return [
      "Start small and be consistent rather than perfect",
      "Celebrate small wins and progress you make",
      "Reach out for support when you need it",
      "Remember that improvement takes time and patience",
      "Focus on progress, not perfection"
    ];
  };

  const getDayFocusArea = (day: number, lowFactors: any[]): string => {
    const personalizedFocusAreas = [
      "Self-Awareness & Assessment", 
      lowFactors[0]?.name || "Mindfulness", 
      lowFactors[1]?.name || "Physical Health", 
      lowFactors[2]?.name || "Social Connection",
      "Stress & Challenge Management", 
      "Creativity & Joy", 
      "Rest & Recovery", 
      "Emotional Regulation",
      "Building Resilience", 
      "Integration & Planning"
    ];
    return personalizedFocusAreas[day - 1] || lowFactors[0]?.name || "General Wellness";
  };

  // Mark day as completed
  const markDayCompleted = (day: number) => {
    const newCompleted = new Set(completedDays);
    if (newCompleted.has(day)) {
      newCompleted.delete(day);
    } else {
      newCompleted.add(day);
    }
    setCompletedDays(newCompleted);
    setPlanProgress((newCompleted.size / 10) * 100);
  };

  if (!assessmentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/analysis')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your 10-Day Mental Health Journey
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              A personalized improvement plan based on your assessment
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedDays.size}/10 days
                </span>
              </div>
              <Progress value={planProgress} className="h-3 [&>div]:bg-yellow-500" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Generating your personalized plan...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Day Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Days Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayPlans.map((plan) => (
                    <Button
                      key={plan.day}
                      variant={selectedDay === plan.day ? "default" : "ghost"}
                      className={`w-full justify-start h-auto min-h-[60px] p-3 ${
                        selectedDay === plan.day 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                          : completedDays.has(plan.day) 
                            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30' 
                            : ''
                      }`}
                      onClick={() => setSelectedDay(plan.day)}
                    >
                      <div className="flex items-start gap-3 w-full min-w-0">
                        {completedDays.has(plan.day) ? (
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${
                            selectedDay === plan.day ? 'text-black' : 'text-green-600'
                          }`} />
                        ) : (
                          <div className={`h-5 w-5 rounded-full border-2 shrink-0 ${
                            selectedDay === plan.day 
                              ? 'border-black' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`} />
                        )}
                        <div className="text-left flex-1 min-w-0">
                          <div className={`font-medium leading-tight ${
                            selectedDay === plan.day ? 'text-black' : 'text-gray-900 dark:text-white'
                          }`}>
                            Day {plan.day}
                          </div>
                          <div className={`text-xs leading-tight break-words ${
                            selectedDay === plan.day 
                              ? 'text-black/70' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {plan.focusArea}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {dayPlans.find(p => p.day === selectedDay) && (
                <div className="space-y-6">
                  {(() => {
                    const currentPlan = dayPlans.find(p => p.day === selectedDay)!;
                    return (
                      <>
                        {/* Day Header */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-2xl">
                                  Day {currentPlan.day}: {currentPlan.title}
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                  {currentPlan.description}
                                </CardDescription>
                              </div>
                              <Button
                                onClick={() => markDayCompleted(currentPlan.day)}
                                variant={completedDays.has(currentPlan.day) ? "default" : "outline"}
                                className={`shrink-0 ${
                                  completedDays.has(currentPlan.day) 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
                                }`}
                              >
                                {completedDays.has(currentPlan.day) ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Target className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-600">
                                <Clock className="h-3 w-3" />
                                {currentPlan.estimatedTime}
                              </Badge>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                Focus: {currentPlan.focusArea}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>

                        {/* Activities */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Play className="h-5 w-5" />
                              Today's Activities
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {currentPlan.activities.map((activity, index) => (
                              <div key={activity.id} className="border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                    {getActivityIcon(activity.type)}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {activity.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {activity.duration}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {activity.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Goals & Tips */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Today's Goals
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {currentPlan.goals.map((goal, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Target className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    <span className="text-sm">{goal}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Helpful Tips
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {currentPlan.tips.map((tip, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Heart className="h-4 w-4 text-pink-600 mt-0.5 shrink-0" />
                                    <span className="text-sm">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                            disabled={selectedDay === 1}
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous Day
                          </Button>
                          <Button
                            onClick={() => setSelectedDay(Math.min(10, selectedDay + 1))}
                            disabled={selectedDay === 10}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next Day
                            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovementPlan;
