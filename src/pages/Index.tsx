
import { ArrowRight, BarChart3, Brain, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const features = [
    {
      title: "Predictive Analytics",
      description: "Use machine learning to forecast which employees are most likely to leave, with up to 85% accuracy.",
      icon: BarChart3,
    },
    {
      title: "AI-Powered Insights",
      description: "Leverage GPT-4o to analyze employee feedback and generate personalized retention strategies.",
      icon: Brain,
    },
    {
      title: "Real-time Monitoring",
      description: "Track changes in employee satisfaction and engagement as they happen.",
      icon: Clock,
    },
    {
      title: "Team-level Analysis",
      description: "Identify departments or teams at higher risk and implement targeted interventions.",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-heading">
                Powerful Features for HR Professionals
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform combines machine learning and AI to help you reduce employee turnover and build a stronger workforce.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-thrive-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-heading">
                Proven Results
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Companies using our platform see significant improvements in employee retention.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-4xl font-bold text-thrive-600 mb-2">20%</div>
                <p className="text-gray-600">Average reduction in employee turnover</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-4xl font-bold text-thrive-600 mb-2">85%</div>
                <p className="text-gray-600">Prediction accuracy for employee departures</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-4xl font-bold text-thrive-600 mb-2">3.5x</div>
                <p className="text-gray-600">ROI on retention investments</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-thrive-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Improve Employee Retention?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join hundreds of companies already using Thrive to build stronger, more engaged teams.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="font-medium">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-thrive-400"
                >
                  <path d="M16 16h6"></path>
                  <path d="M21 10V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7"></path>
                  <path d="M12 4v4"></path>
                  <path d="M9 4v1"></path>
                  <path d="M15 4v1"></path>
                  <path d="M16 19h6"></path>
                  <path d="M19 16v6"></path>
                </svg>
                <span className="text-lg font-semibold">Thrive</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered employee retention platform for forward-thinking HR teams.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Data Processing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} Thrive Employee Insights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
