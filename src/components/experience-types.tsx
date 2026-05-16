"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Users, Heart, Camera } from "lucide-react";

export default function ExperienceTypes() {
  const experiences = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Turismo Romântico",
      description: "Experiências íntimas em praias desertas e roças históricas, perfeitas para casais em lua de mel"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Eco-Aventura",
      description: "Explore o Parque Nacional Obô, trilhas na selva e mergulhos em águas cristalinas com guias locais"
    },
    {
      icon: <Camera className="w-8 h-8 text-green-500" />,
      title: "Cultura e História",
      description: "Mergulhe na rica história das roças, na rota do café e chocolate e nas tradições santomenses"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="roteiros" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Escolha sua experiência
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada tipo de turismo é uma porta para descobrir São Tomé e Príncipe de forma única e inesquecível
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {experiences.map((experience, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <motion.div
                    className="mb-6 flex justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {experience.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {experience.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {experience.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}