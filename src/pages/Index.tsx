import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageSquare, BarChart, Sparkles, HeartPulse, Users, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Add Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 py-20 px-4"> {/* Added padding-top to account for fixed navbar */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-30"></div>
              <div className="relative h-16 w-16 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg">
                <Brain className="h-9 w-9 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <h1 className="text-7xl font-bold mb-6 text-gray-900 dark:text-gray-50">सह-<span className="text-yellow-500">AI</span>-यक</h1>
          <p className="text-2xl mb-10 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your compassionate AI companion for mental wellness. 
            <span className="block mt-2 font-medium">Because mental health matters—<span className="text-yellow-500 font-bold">let's talk!</span></span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-base gap-2 shadow-md hover:shadow-lg transition-all"
              onClick={() => navigate('/analysis')}
            >
              <BarChart className="h-5 w-5" /> 
              Take Mental Health Assessment
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base gap-2 hover:bg-yellow-500/10 transition-all"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="h-5 w-5" />
              Chat with AI Assistant
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-50">How सह-AI-यक Supports Your Mental Wellbeing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered platform offers personalized tools to understand, track, and improve your mental health.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Comprehensive Assessment</CardTitle>
                <CardDescription>Understand your mental health status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Take our scientifically-based assessment to receive a detailed analysis of your mental wellbeing across 8 critical dimensions.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2 w-full justify-center"
                  onClick={() => navigate('/analysis')}
                >
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle className="text-xl">AI Conversational Support</CardTitle>
                <CardDescription>Talk freely without judgment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI assistant provides empathetic conversation, insights, and evidence-based coping strategies tailored to your unique situation.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 gap-2 w-full justify-center"
                  onClick={() => navigate('/chat')}
                >
                  Start Chatting
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Personalized Insights</CardTitle>
                <CardDescription>Gain clarity and direction</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive customized recommendations, track your progress over time, and develop a deeper understanding of your mental health patterns.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 gap-2 w-full justify-center"
                  onClick={() => navigate('/analysis')}
                >
                  Explore Insights
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-50">Your Mental Wellness Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A simple, confidential process designed to support you every step of the way.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line in desktop view - Fixed positioning */}
            <div className="hidden md:block absolute h-0.5 bg-gray-200 dark:bg-gray-700" 
              style={{ 
                top: '1.8rem', /* Align with the center of the circles */
                left: '15%',   /* Start from the center of the first circle */
                right: '15%',  /* End at the center of the last circle */
                zIndex: 0      /* Ensure it stays behind the step circles */
              }}></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-md opacity-30"></div>
                <div className="relative h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center z-10 border-4 border-white dark:border-gray-800">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-50">Take the Assessment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete our comprehensive mental health assessment to evaluate your current wellbeing across multiple dimensions.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-400 to-violet-600 rounded-full blur-md opacity-30"></div>
                <div className="relative h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center z-10 border-4 border-white dark:border-gray-800">
                  <span className="text-xl font-bold text-violet-600 dark:text-violet-400">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-50">Review Your Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive a detailed analysis with personalized insights, strengths, areas for improvement, and actionable recommendations.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur-md opacity-30"></div>
                <div className="relative h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center z-10 border-4 border-white dark:border-gray-800">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-50">Ongoing Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Chat with our AI assistant anytime to discuss your feelings, get guidance, and track your progress toward better mental health.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/analysis')} 
              className="gap-2 shadow-md"
            >
              Begin Your Journey
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats and Benefits Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-50">Why Mental Health Matters</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Proactive mental health care benefits every aspect of your life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <HeartPulse className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">20%</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    of adults experience a mental health issue each year
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-10 w-10 text-blue-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">60%</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    of people with mental health issues don't receive treatment
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="h-10 w-10 text-amber-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">80%</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    improvement in quality of life with proper mental health support
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-10 w-10 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">24/7</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    access to support can significantly reduce crisis situations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-50">Our Commitment to You</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-start p-6 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">Privacy First</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is private and secure. We use state-of-the-art encryption and never share your personal information with third parties.
              </p>
            </div>
            
            <div className="flex flex-col items-start p-6 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">Evidence-Based Approach</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Our assessment tools and recommendations are grounded in psychological research and clinical best practices.
              </p>
            </div>
            
            <div className="flex flex-col items-start p-6 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">Accessible Support</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Available 24/7, our AI assistant provides immediate support when you need it, complementing (not replacing) professional care.
              </p>
            </div>
            
            <div className="flex flex-col items-start p-6 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">Continuous Improvement</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                We regularly update our system with the latest research and user feedback to provide the most effective support possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">Start Your Mental Wellness Journey Today</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Take the first step toward better mental health with our comprehensive assessment and AI-powered support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-base gap-2 shadow-md hover:shadow-lg transition-all"
              onClick={() => navigate('/analysis')}
            >
              <BarChart className="h-5 w-5" /> 
              Take Assessment Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base gap-2 hover:bg-yellow-500/10 transition-all"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="h-5 w-5" />
              Start Chatting
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
