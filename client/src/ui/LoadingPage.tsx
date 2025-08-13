import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo2.png";

interface Stats {
  users: number;
  freelancers: number;
  projects: number;
}

// Mock API function - replace with your actual API call
const getStats = async (): Promise<Stats> => {
  try {
    const response = await fetch('/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error(error);
    return { users: 0, freelancers: 0, projects: 0 };
  }
};

const useCounter = (end: number, duration = 2000, delay = 0) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, duration, delay, isVisible]);

  return { count, setIsVisible };
};

interface StatCardProps {
  value: number;
  label: string;
  delay: number;
}

const StatCard = ({ value, label, delay }: StatCardProps) => {
  const { count, setIsVisible } = useCounter(value || 0, 2000, delay);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [setIsVisible]);

  return (
    <div className="bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl border border-gray-200 hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
      <p className="text-5xl font-bold mb-2 text-blue-900">{count.toLocaleString()}</p>
      <p className="text-xl text-blue-800">{label}</p>
    </div>
  );
};

export default function LandingPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, freelancers: 0, projects: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const features = [
    {
      title: "Connect with Top Talent",
      description: "Access thousands of skilled freelancers across all development fields"
    },
    {
      title: "Diverse Projects",
      description: "From simple websites to complex enterprise applications"
    },
    {
      title: "Secure Platform",
      description: "Protected payments and quality assurance for every project"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-20">

          {/* Logo */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
              <img src={logo} alt="DevMatch Logo" className="h-12 w-auto" />
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center text-blue-900">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                DevMatch
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-16 max-w-4xl mx-auto leading-relaxed opacity-90">
              The leading platform connecting clients with talented freelancers
              <br />
              for amazing development projects
            </p>

            {/* Stats */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
                <StatCard value={stats.users} label="Active Users" delay={0} />
                <StatCard value={stats.freelancers} label="Expert Freelancers" delay={200} />
                <StatCard value={stats.projects} label="Projects Completed" delay={400} />
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse p-8 rounded-2xl shadow-xl" />
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-12 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Join Now
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent border-2 border-blue-900 hover:bg-blue-900 hover:text-white text-blue-900 px-12 py-4 rounded-full text-xl font-semibold transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 text-blue-900">
            Why Choose <span className="text-yellow-400">DevMatch</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <h3 className="text-2xl font-bold mb-4 text-blue-900">{feature.title}</h3>
                <p className="text-lg text-blue-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="DevMatch Logo" className="h-8 w-auto opacity-80" />
          </div>
          <p className="text-lg text-blue-900 mb-4">
            The leading platform for connecting clients and freelancers
          </p>
          <div className="text-sm text-blue-700 opacity-70">
            © 2024 DevMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
