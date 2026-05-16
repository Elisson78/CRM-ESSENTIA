"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, Euro, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Passeio {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: string;
  categoria: string;
  imagens?: string | string[] | null;
  capacidadeMaxima?: number;
  ativo: number;
}

interface PasseiosCardsProps {
  destaque?: boolean;
  limite?: number;
}

// Emojis para categorias de passeios (fallback quando não há imagens)
const emojisPorCategoria: { [key: string]: string } = {
  "História": "🏛️",
  "Histórico": "🏛️",
  "Religioso": "⛪",
  "Natureza": "🌲",
  "Gastronomia": "🍽️",
  "Romântico": "💕",
  "Romance": "💕",
  "Cultural": "🎨",
  "Aventura": "🧗",
  "Arte": "🎨"
};

export default function PasseiosCards({ destaque = false, limite }: PasseiosCardsProps) {
  const [passeios, setPasseios] = useState<Passeio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarPasseios = async () => {
      try {
        console.log('🔄 Carregando passeios da API...');
        const response = await fetch('/api/passeios');

        console.log('📡 Status da resposta:', response.status);

        if (response.ok) {
          let data = await response.json();
          console.log('✅ Dados recebidos:', data.length, 'passeios');

          // Filtrar apenas passeios ativos (aceitar 1, true ou valores truthy)
          data = data.filter((passeio: Passeio) => Boolean(passeio.ativo));

          console.log('✅ Passeios ativos:', data.length);

          // Limitar quantidade se especificado
          if (limite) {
            data = data.slice(0, limite);
          }

          // Se não houver dados, usar fallback
          if (data.length === 0) {
            console.warn('⚠️ Nenhum passeio encontrado no banco. Usando dados de demonstração.');
            data = getDadosFallback();
          }

          setPasseios(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Erro na API:', response.status, errorData);
          console.log('📦 Usando dados de demonstração devido a erro na API');
          setPasseios(getDadosFallback());
        }
      } catch (error) {
        console.error('❌ Erro ao carregar passeios:', error);
        console.log('📦 Usando dados de demonstração devido a erro de rede');
        setPasseios(getDadosFallback());
      } finally {
        setLoading(false);
      }
    };

    carregarPasseios();
  }, [limite]);

  // Função para retornar dados de fallback
  const getDadosFallback = (): Passeio[] => [
    {
      id: "fallback-1",
      nome: "Rota do Chocolate e Café",
      descricao: "Visite as históricas Roças Monte Café e Agostinho Neto. Deguste o melhor chocolate do mundo.",
      preco: 45,
      duracao: "4h",
      categoria: "Cultural",
      imagens: ["https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000"],
      capacidadeMaxima: 15,
      ativo: 1
    },
    {
      id: "fallback-2",
      nome: "Expedição ao Obô National Park",
      description: "Trilhas pela selva densa até a Lagoa Amélia. Conheça a fauna e flora endêmica das ilhas.",
      preco: 60,
      duracao: "6h",
      categoria: "Natureza",
      imagens: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000"],
      capacidadeMaxima: 10,
      ativo: 1
    },
    {
      id: "fallback-3",
      nome: "Observação de Tartarugas",
      description: "Acompanhe a desova ou a soltura de tartarugas marinhas na Praia Jalé sob as estrelas.",
      preco: 35,
      duracao: "3h",
      categoria: "Natureza",
      imagens: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000"],
      capacidadeMaxima: 12,
      ativo: 1
    },
    {
      id: "fallback-4",
      nome: "Ilhéu das Rolas e Linha do Equador",
      description: "Um dia inteiro na ilha onde o mundo se divide. Almoço com vista para o mar azul.",
      preco: 75,
      duracao: "8h",
      categoria: "Aventura",
      imagens: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000"],
      capacidadeMaxima: 20,
      ativo: 1
    },
    {
      id: "fallback-5",
      nome: "Tour da Cidade de São Tomé",
      description: "Descubra o Mercado Municipal, a Sé Catedral e a arquitetura colonial da capital.",
      preco: 30,
      duracao: "3h",
      categoria: "Histórico",
      imagens: ["https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000"],
      capacidadeMaxima: 25,
      ativo: 1
    },
    {
      id: "fallback-6",
      nome: "Mergulho na Lagoa Azul",
      description: "Explore os recifes de coral e a vida marinha abundante nas águas mais claras da ilha.",
      preco: 55,
      duracao: "4h",
      categoria: "Aventura",
      imagens: ["https://images.unsplash.com/photo-1541167760496-1628856ab752?auto=format&fit=crop&q=80&w=1000"],
      capacidadeMaxima: 8,
      ativo: 1
    }
  ];

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (passeios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum passeio disponível no momento.</p>
        <p className="text-gray-400 text-sm mt-2">Volte em breve para ver nossas ofertas!</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${destaque ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
      }`}>
      {passeios.map((passeio, index) => (
        <motion.div
          key={passeio.id}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.15, type: "spring", stiffness: 100 }}
          className="transform transition-all duration-300"
        >
          <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-orange-300 shadow-lg hover:shadow-orange-200/50">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Imagem do passeio */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Badge className="bg-blue-600 text-white shadow-lg">
                    {passeio.categoria}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-600 text-white shadow-lg">
                    Disponível
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                    🔥 Até 15% OFF
                  </Badge>
                </div>
                {(() => {
                  // Lógica simplificada idêntica à página de detalhes (page.tsx)
                  // O backend já deve garantir que passeio.imagens é um array de strings
                  const rawImagens = passeio.imagens;
                  let primeiraImagem: string | null = null;

                  if (Array.isArray(rawImagens) && rawImagens.length > 0) {
                    primeiraImagem = rawImagens[0];
                  } else if (typeof rawImagens === 'string' && rawImagens.trim().length > 0) {
                    // Caso raro onde o backend retorne string crua
                    const trimmed = rawImagens.trim();
                    if (trimmed.startsWith('[')) {
                      try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed) && parsed.length > 0) primeiraImagem = parsed[0];
                      } catch (e) { primeiraImagem = trimmed; }
                    } else {
                      primeiraImagem = trimmed;
                    }
                  }

                  if (primeiraImagem) {
                    primeiraImagem = primeiraImagem.replace(/^"|"$/g, '');
                  }

                  if (primeiraImagem) {
                    return (
                      <div className="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={primeiraImagem}
                          alt={passeio.nome}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 text-sm">Sem imagem</span>
                    </div>
                  );
                })()}
              </div>

              {/* Conteúdo do card */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {passeio.nome}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {passeio.descricao}
                  </p>

                  {/* Informações do passeio */}
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Duração: {passeio.duracao}</span>
                    </div>
                    {passeio.capacidadeMaxima && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Máx: {passeio.capacidadeMaxima}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preço e botão de ação */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 line-through">
                        € {Number(passeio.preco * 1.15).toFixed(2)}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        € {Number(passeio.preco).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Link href={`/passeio/${passeio.id}`}>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                      size="sm"
                    >
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
