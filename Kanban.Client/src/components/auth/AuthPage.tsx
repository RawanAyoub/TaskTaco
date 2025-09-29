import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* TaskTaco Branding Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/src/components/ui/TaskTaco_logo.png" 
              alt="TaskTaco Logo" 
              className="w-20 h-20 mx-auto"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-orange-500 mb-2">TaskTaco</h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your productivity companion
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <div>
          {isLoginMode ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
};
