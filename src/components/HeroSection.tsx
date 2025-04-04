
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="hero-pattern min-h-[90vh] flex items-center">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight gradient-heading">
              Predict & Prevent Employee Turnover
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-lg">
              Leverage AI-powered insights to identify at-risk employees and implement effective retention strategies before it's too late.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="font-medium">
                  Get Started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="font-medium">
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Join 500+ companies already reducing turnover by up to 20%
              </p>
            </div>
          </div>
          <div className="hidden md:flex justify-center animate-fade-in">
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-thrive-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-thrive-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-thrive-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              <div className="relative">
                <div className="bg-white backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="mb-6 flex justify-between">
                    <h3 className="font-semibold text-lg text-gray-800">Employee Retention Dashboard</h3>
                    <span className="text-sm text-gray-500">Last updated today</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">At Risk Employees</span>
                        <span className="text-lg font-bold text-risk-high">24</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-risk-high h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Medium Risk</span>
                        <span className="text-lg font-bold text-risk-medium">43</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-risk-medium h-2 rounded-full" style={{ width: '27%' }}></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Low Risk</span>
                        <span className="text-lg font-bold text-risk-low">91</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-risk-low h-2 rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
