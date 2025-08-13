import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './features/auth/Login'
import SignUp from './features/auth/SignUp'
import LandingPage from './ui/LoadingPage'
import FreelancerProfile from './features/profiles/freelancerProfile/components/FreelancerProfile'
import ClientProfile from './features/profiles/clientProfile/components/ClientProfile'
import ProfileRouter from './features/profiles/ProfileRouter'
import ListProjects from './features/projects/ListProjects'
import ListFreelancers from './features/freelancers/ListFreelancers'
import ListPosts from './features/posts/ListPosts'
import CreatePost from './features/posts/CreatePost'
import { AuthProvider } from './features/auth/AuthContext'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/freelancers" element={<ListFreelancers />} />
          <Route path="/projects" element={<ListProjects />} />
          <Route path="/posts" element={<ListPosts />} />
          <Route
            path="/profile"
            element={
              <>
                {console.log("Route: /profile - rendering ProfileRouter")}
                <ProfileRouter />
              </>
            }
          />
          <Route path="/freelancerProfile/:userId" element={<FreelancerProfile />} />
          <Route path="/clientProfile/:clientId" element={<ClientProfile />} />
          <Route path="/createPost" element={<CreatePost />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  )
}

export default App