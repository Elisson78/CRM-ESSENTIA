"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Users, Clock, MapPin, MessageCircle, Award } from "lucide-react";

export default function Differentials() {
  const differentials = [
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Guias Locais Experientes",
      description: "Nossos guias são nativos das ilhas e conhecem cada trilha e segredo de STP"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-500" />,
      title: "Suporte 24h",
      description: "Estamos sempre disponíveis para ajudar você durante toda sua viagem"
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-500" />,
      title: "Roteiros Personalizados",
      description: "Criamos experiências únicas baseadas nos seus interesses e preferências"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-orange-500" />,
      title: "Atendimento Multilíngue",
      description: "Falamos português, italiano, inglês e espanhol fluentemente"
    },
    {
      icon: <Award className="w-8 h-8 text-red-500" />,
      title: "Experiências Autênticas",
      description: "Conectamos você com a verdadeira cultura santomense, o 'Leve Leve' e a natureza pura"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="diferenciais" className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Por que escolher a EXPLORA AVENTURA?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Especialistas em conectar viajantes à verdadeira essência de São Tomé e Príncipe
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {differentials.map((differential, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-orange-500">
                <CardContent className="p-6">
                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {differential.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors">
                    {differential.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {differential.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid md:grid-cols-3 gap-8 text-center"
        >
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600">500+</div>
            <div className="text-muted-foreground">Viajantes satisfeitos</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600">15+</div>
            <div className="text-muted-foreground">Cidades cobertas</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600">4.9★</div>
            <div className="text-muted-foreground">Avaliação média</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}