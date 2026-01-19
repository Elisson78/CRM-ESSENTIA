"use client";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToPasseios = () => {
    const element = document.getElementById('destinos');
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Aguardar um pouco e então activar os passeios
      setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent?.includes('Ver Passeios')) {
            button.click();
            break;
          }
        }
      }, 500);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">ESSENTIA</h1>
          <span className="ml-2 text-sm text-muted-foreground hidden sm:block">

          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection('roteiros')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Roteiros
          </button>
          <button
            onClick={() => scrollToSection('destinos')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Destinos
          </button>
          <button
            onClick={scrollToPasseios}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium text-orange-500 hover:text-orange-600"
          >
            Passeios
          </button>
          <button
            onClick={() => scrollToSection('diferenciais')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Por que nos escolher
          </button>
          <button
            onClick={() => scrollToSection('contato')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contato
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Menu hamburger para mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:block">{user.nome}</span>
                <span className="text-xs text-gray-500 capitalize">({user.userType})</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block ml-2">Sair</span>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="bg-white text-gray-900 border-gray-200 hover:bg-gray-50">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Slide */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 md:hidden shadow-xl border-r"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header do Menu */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-blue-600">ESSENTIA TRAVEL</h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navegação */}
                <nav className="flex-1 space-y-4">
                  <button
                    onClick={() => {
                      scrollToSection('roteiros');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    🗺️ Roteiros
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection('destinos');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    🏛️ Destinos
                  </button>

                  <button
                    onClick={() => {
                      scrollToPasseios();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors font-medium"
                  >
                    🎯 Passeios
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection('diferenciais');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    ⭐ Por que nos escolher
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection('contato');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    📞 Contato
                  </button>
                </nav>

                {/* Ações de Login/Cadastro na parte inferior */}
                {!user && (
                  <div className="border-t border-gray-200 pt-6 space-y-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Cadastrar
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Informações do usuário logado */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
