"use client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-400" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra a Magia da
            <span className="text-orange-300"> Itália</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Explore a Itália com quem entende. Roteiros únicos, guias locais
            experientes e experiências autênticas que você nunca esquecerá.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => scrollToSection('roteiros')}
            >
              Conheça os Roteiros
            </Button>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-24 h-24 bg-orange-300/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-300/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </section>
  );
}