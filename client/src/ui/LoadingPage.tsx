import { useEffect, useState } from "react";
import { getStats } from "../api/stateApi";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo2.png";

// טיפוסים לסטטיסטיקות
interface Stats {
  users: number;
  freelancers: number;
  projects: number;
}

// hook לספירה
const useCounter = (
  end: number,
  duration: number = 2000,
  delay: number = 0
) => {
  const [count, setCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

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

// פרופס לקומפוננטת כרטיס סטטיסטיקה
interface StatCardProps {
  value: number;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, delay }) => {
  const { count, setIsVisible } = useCounter(value || 0, 2000, delay);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [setIsVisible]);

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white border-opacity-30 hover:bg-opacity-25 transition-all duration-300 transform hover:scale-105">
      <p className="text-5xl font-bold mb-2 text-white">{count.toLocaleString()}</p>
      <p className="text-xl text-blue-100">{label}</p>
    </div>
  );
};

export default function LandingPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, freelancers: 0, projects: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStats()
      .then((data: Stats) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const features: { title: string; description: string }[] = [
    { title: "Connect with Top Talent", description: "Access thousands of skilled freelancers across all development fields" },
    { title: "Diverse Projects", description: "From simple websites to complex enterprise applications" },
    { title: "Secure Platform", description: "Protected payments and quality assurance for every project" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
              <img src={logo} alt="DevMatch Logo" className="h-12 w-auto" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center text-white">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                DevMatch
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-16 max-w-4xl mx-auto leading-relaxed opacity-90">
              The leading platform connecting clients with talented freelancers
              <br />for amazing development projects
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
                  <div key={i} className="bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white border-opacity-30 animate-pulse">
                    <div className="h-12 bg-white bg-opacity-30 rounded mb-2"></div>
                    <div className="h-6 bg-white bg-opacity-20 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <button
                onClick={() => navigate('/signup')}
                className="group bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-12 py-4 rounded-full text-xl font-semibold shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Join Now
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-12 py-4 rounded-full text-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white bg-opacity-5 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">
            Why Choose <span className="text-yellow-400">DevMatch</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-300 transform hover:scale-105">
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-lg text-blue-100 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 bg-opacity-50 backdrop-blur-sm py-12 border-t border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="DevMatch Logo" className="h-8 w-auto opacity-80" />
          </div>
          <p className="text-lg text-blue-100 mb-4">
            The leading platform for connecting clients and freelancers
          </p>
          <div className="text-sm text-blue-200 opacity-70">
            © 2024 DevMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
