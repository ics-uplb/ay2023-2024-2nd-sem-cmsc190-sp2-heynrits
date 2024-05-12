'use client';
// router navigation in nextjs
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we are on the client side before using localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      } else {
        router.replace('/home');
      }
    }
  }, []);

  return (
    <>
      Please wait...
    </>
  )
}
