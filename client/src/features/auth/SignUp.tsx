import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/logo.png";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { signUpUser } from "../../api/authApi"
import { validateSignUpForm } from "../../utils/formUserValidate";
import { useAuth } from "../auth/AuthContext"; // הוסף את זה!

type SignUpProps = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "freelancer" | "client" | "admin" | null;
};

const SignUp = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth(); // הוסף את זה!

  const [formData, setFormData] = useState<SignUpProps>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "freelancer",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateSignUpForm(formData, setError)) return;

    setIsLoading(true);
    try {
      const response = await signUpUser(formData);
      
      console.log("✅ SignUp successful, user data:", response.data.user);

      setCurrentUser(response.data.user);
      
      toast.success("ההרשמה הצליחה!");
      navigate("/profile");
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-3/4 text-center mt-9 p-5 shadow-xl md:w-1/2"
      >
        <img className="w-24 rounded-full mx-auto" src={logo} alt="logo" />
        <h1 className="text-2xl font-bold py-6">Create your account</h1>

        <Input
          label="Name"
          placeholder="Please enter your name"
          variant="outline"
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
        />

        <Input
          label="Last Name"
          placeholder="Please enter your last name"
          variant="outline"
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
        />

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

        <div className="text-left mt-5 flex items-center">
          <label className="block font-medium mb-1 text-left mr-3" htmlFor="role">
            Role:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 border-gray-400"
            required
          >
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
          </select>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-4 mb-2 font-medium">{error}</p>
        )}

        <div className="my-9">
          <Button 
            text={isLoading ? "Creating account..." : "Create account"} 
            variant="primary" 
            className="p-3" 
            type="submit"
            disabled={isLoading}
          />
        </div>

        <Link to="/login" className="text-black-500 hover:underline">
          <h3>Back to sign in</h3>
        </Link>
      </form>
    </div>
  );
};

export default SignUp;