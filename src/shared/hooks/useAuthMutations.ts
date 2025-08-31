import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations/auth.mutations';

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

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      authLogin(data.login.token, data.login.user);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      authLogin(data.register.token, data.register.user);
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
