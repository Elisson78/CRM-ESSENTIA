"use client";

import PasseiosCards from "@/components/passeios-cards";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

export default function PasseiosPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section Simplificada para a página de passeios */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Nossos Passeios
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Descubra as experiências mais autênticas e memoráveis de São Tomé e Príncipe. 
            Roteiros selecionados para todos os perfis de aventureiros.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <PasseiosCards />
      </div>

      <Footer />
    </main>
  );
}
