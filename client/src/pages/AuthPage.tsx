import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useApp } from '../contexts/AppContext';
import logo from '../assets/logo.png';

// Import your Firebase auth functions (Adjust the path as needed!)
import { 
  doSignInWithEmailAndPassword, 
  doCreateUserWithEmailAndPassword, 
  doSignInWithGoogle 
} from '../firebase/auth'; 

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await doSignInWithEmailAndPassword(email, password);
      } else {
        userCredential = await doCreateUserWithEmailAndPassword(email, password);
      }
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      // Sync with MongoDB (non-blocking, graceful fallback)
      try {
        const syncRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            name: name || user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            persona: 'reader'
          })
        });
        if (!syncRes.ok) {
          console.warn('Profile sync failed, continuing anyway:', syncRes.status);
        }
      } catch (syncErr) {
        // Auth sync is non-critical - user can still proceed
        console.warn('Auth sync unavailable, continuing:', syncErr);
      }
      login(user.email || ''); 
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsAuthenticating(true);
    try {
      const result = await doSignInWithGoogle();
      const user = result.user;
      const idToken = await user.getIdToken();
      // Sync with MongoDB (non-blocking, graceful fallback)
      try {
        const syncRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            persona: 'reader'
          })
        });
        if (!syncRes.ok) {
          console.warn('Profile sync failed, continuing anyway:', syncRes.status);
        }
      } catch (syncErr) {
        // Auth sync is non-critical - user can still proceed
        console.warn('Auth sync unavailable, continuing:', syncErr);
      }
      login(user.email || '');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logo} 
            alt="Namaste News Times" 
            className="h-16 w-auto object-contain mr-4"
          />
          <div>
            <span className="text-gray-900 font-bold text-xl tracking-tight">Namaste News Times</span>
            <span className="text-orange-700 ml-1 font-bold">AI</span>
          </div>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              {isLogin 
                ? 'Sign in to access your personalized newsroom' 
                : 'Join the future of business journalism'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2">
            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={true} // X auth isn't wired up yet
                  className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white text-gray-400 px-2">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Name field for sign up */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      disabled={isAuthenticating}
                      className="border-gray-200 pl-10 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isAuthenticating}
                    className="border-gray-200 pl-10 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isAuthenticating}
                    className="border-gray-200 pl-10 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isAuthenticating}
                className="w-full glow-button text-white mt-2 disabled:opacity-70"
              >
                {isAuthenticating ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!isAuthenticating && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <span className="text-gray-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(''); // Clear errors when switching modes
                }}
                disabled={isAuthenticating}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}