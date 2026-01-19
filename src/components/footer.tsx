"use client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contato" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-blue-400 mb-4">ESSENTIA TRAVEL</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Explore a Itália com quem entende. Sua jornada dos sonhos começa aqui.
            </p>
            <div className="flex space-x-4">
              <Button 
                size="icon" 
                variant="outline" 
                className="border-gray-600 hover:bg-blue-600 hover:border-blue-600"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline"
                className="border-gray-600 hover:bg-green-600 hover:border-green-600"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#roteiros" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Nossos Roteiros
                </a>
              </li>
              <li>
                <a href="#destinos" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Destinos
                </a>
              </li>
              <li>
                <a href="#diferenciais" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Por que nos escolher
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Depoimentos
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Roteiros Personalizados</li>
              <li className="text-gray-300">Guias Locais</li>
              <li className="text-gray-300">Suporte 24h</li>
              <li className="text-gray-300">Experiências Gastronômicas</li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">contato@essentia.travel</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">+39 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">+55 11 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-gray-300 text-sm">Roma, Itália</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-700 my-8"
        />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 ESSENTIA TRAVEL. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              Cookies
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}