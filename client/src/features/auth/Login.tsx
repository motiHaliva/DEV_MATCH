import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import logo from "../../images/logo.png";
import { toast } from "react-toastify"; 
import { loginUser } from "../../api/authApi";
import {validateLoginForm} from "../../utils/formLoginValidate"

export const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
    if (!validateLoginForm(formData, setError)) {
    return;
  }
  setIsLoading(true);

  try {
    await loginUser(formData); 
    toast.success("התחברת בהצלחה!");
    navigate("/profile");
  } catch (err: any) {
   const errorMessage =
  err.response?.data?.message ||
  err.response?.data?.error || 
  "Network error or server not available";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center w-screen">
      <form onSubmit={handleSubmit} className=" text-center mt-9 p-5 shadow-xl md:w-1/2">
        <img className="w-24 rounded-full mx-auto" src={logo} alt="logo" />
        <h1 className="text-2xl font-bold py-6">Welcome to Devmatch</h1>

        <Button
          text="Continue with Google"
          variant="google"
          icon={<FcGoogle />}
          className="p-3"
          type="button"
        />

        <div className="flex items-center my-10">
          <div className="flex-grow h-px bg-black" />
          <span className="px-4 text-black-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-black" />
        </div>

        <Input
          label="Email"
          placeholder="you@example.com"
          icon={<FaEnvelope />}
          variant="outline"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          icon={<FaLock />}
          variant="outline"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <div className="my-9">
          <Button 
            text={isLoading ? "Signing in..." : "Sign in"} 
            variant="primary" 
            className="p-3" 
            type="submit"
            disabled={isLoading}
          />
        </div>

        <h2>Forgot password?</h2>
        <Link to="/signup" className="text-black-500 hover:underline">
          <h3>Sign Up</h3>
        </Link>
      </form>
    </div>
  );
};

export default Login;