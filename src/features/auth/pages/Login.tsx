import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {tokenService} from '../../../api/token.service'
import { AuthAPI } from "../../../api/auth.api";
export const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth(); // lấy user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect khi login thành công
  useEffect(() => {
    if (user) navigate("/"); // Redirect ngay khi user có giá trị
  }, [user, navigate]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await login(email, password); // chỉ cần gọi login
    console.log("Đăng nhập thành công!");
  } catch (err) {
    alert("Login failed. Check credentials.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-lime-400 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 to-lime-400 p-8 text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4">
              <Dumbbell className="w-8 h-8 text-sky-500" />
            </div>
            <h1 className="text-3xl text-white mb-2">Welcome Back!</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 py-3 border rounded-lg"/>
              </div>
            </div>
            <div>
              <label>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 py-3 border rounded-lg"/>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center mt-4">Don't have an account? <Link to="/register" className="text-sky-500">Sign up</Link></p>
        </div>
      </motion.div>
    </div>
  );
};
