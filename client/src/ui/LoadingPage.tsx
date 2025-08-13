import { useEffect, useState } from "react";
import { getStats } from "../api/stateApi";

export default function LandingPage() {
  const [stats, setStats] = useState({ users: 0, freelancers: 0, projects: 0 });
  
useEffect(() => {
  getStats()
    .then(data => setStats(data))
    .catch(err => console.error(err));
}, []);

  const handleNavigation = (path:string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 to-blue-600 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      
      {/* Logo */}
      <div className="w-48 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-8">
        <span className="text-3xl font-bold text-white">DevMatch</span>
      </div>
      
      {/* Title */}
      <h1 className="text-5xl font-bold mb-4 text-center">ברוכים הבאים ל־DevMatch</h1>
      <p className="text-lg mb-10 max-w-2xl text-center">
        הפלטפורמה שמחברת בין פרילנסרים, לקוחות ופרויקטים מדהימים — הכל במקום אחד!
      </p>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-10">
        <div className="bg-white bg-opacity-20 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
          <p className="text-4xl font-bold">{stats.users}</p>
          <p className="text-lg">משתמשים</p>
        </div>
        <div className="bg-white bg-opacity-20 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
          <p className="text-4xl font-bold">{stats.freelancers}</p>
          <p className="text-lg">פרילנסרים</p>
        </div>
        <div className="bg-white bg-opacity-20 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
          <p className="text-4xl font-bold">{stats.projects}</p>
          <p className="text-lg">פרויקטים</p>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => handleNavigation('/signup')}
          className="px-8 py-3 bg-white text-blue-600 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          הצטרף עכשיו
        </button>
        <button 
          onClick={() => handleNavigation('/login')}
          className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold text-lg rounded-full hover:bg-white hover:text-blue-600 transition"
        >
          כניסה
        </button>
      </div>
    </div>
  );
}