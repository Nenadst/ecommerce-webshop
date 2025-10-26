import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations/auth.mutations';
import { CREATE_ACTIVITY_LOG } from '../graphql/mutations/activity.mutations';
import toast from 'react-hot-toast';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export function useAuthMutations() {
  const { login: authLogin } = useAuth();
  const [error, setError] = useState<string>('');
  const [createActivityLog] = useMutation(CREATE_ACTIVITY_LOG);

  const trackActivity = async (userId: string, action: string, description: string) => {
    try {
      await createActivityLog({
        variables: {
          input: {
            userId,
            action,
            description,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            path: typeof window !== 'undefined' ? window.location.pathname : undefined,
          },
        },
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      authLogin(data.login.token, data.login.user);
      toast.success('Logged in successfully!');
      trackActivity(
        data.login.user.id,
        'LOGIN',
        `User ${data.login.user.email} logged in successfully`
      );
    },
    onError: (error) => {
      setError(error.message);
      trackActivity('', 'LOGIN_FAILED', `Failed login attempt: ${error.message}`);
    },
  });

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      authLogin(data.register.token, data.register.user);
      toast.success('Registration successful!');
      trackActivity(
        data.register.user.id,
        'REGISTER',
        `New user registered: ${data.register.user.email}`
      );
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const login = async (input: LoginInput) => {
    setError('');
    try {
      await loginMutation({
        variables: { input },
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const register = async (input: RegisterInput) => {
    setError('');
    try {
      await registerMutation({
        variables: { input },
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return {
    login,
    register,
    error,
    setError,
    isLoading: loginLoading || registerLoading,
  };
}
