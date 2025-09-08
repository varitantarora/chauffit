import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to phone login by default
    router.replace('/(auth)/phone-login');
  }, [router]);

  return null;
}