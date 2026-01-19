"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HeroSection from "@/components/hero-section";
import ExperienceTypes from "@/components/experience-types";
import Destinations from "@/components/destinations";
import Differentials from "@/components/differentials";
import Footer from "@/components/footer";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || loading || !user) return;

    const type = user.userType ?? 'admin';

    if (type === 'admin') {
      router.push('/admin');
    } else if (type === 'guia') {
      router.push('/guia');
    } else if (type === 'cliente') {
      router.push('/cliente');
    }
  }, [user, loading, router, isMounted]);

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <ExperienceTypes />
      <Destinations />
      <Differentials />
      <Footer />
    </main>
  );
}
