"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Star } from "lucide-react";
import PasseiosCards from "./passeios-cards";
import { useEffect } from "react";

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  highlights: string[];
}

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: "1",
      name: "Ilhéu das Rolas",
      description: "Onde o Equador divide o mundo, com praias de águas cristalinas",
      image: "🏝️",
      rating: 4.9,
      highlights: ["Linha do Equador", "Praia Café", "Ponta do Sol"]
    },
    {
      id: "2", 
      name: "Lagoa Azul",
      description: "Baía deslumbrante com águas azul-turquesa e baobás centenários",
      image: "🌊",
      rating: 4.8,
      highlights: ["Mergulho", "Baobás", "Farol da Lagoa"]
    },
    {
      id: "3",
      name: "Praia Jalé",
      description: "Santuário ecológico famoso pela desova de tartarugas marinhas",
      image: "🐢",
      rating: 4.9,
      highlights: ["Eco-turismo", "Desova de tartarugas", "Praia Selvagem"]
    },
    {
      id: "4",
      name: "Pico Cão Grande",
      description: "O monumento natural mais icônico, uma agulha vulcânica majestosa",
      image: "🌋",
      rating: 4.6,
      highlights: ["Fotografia", "Obo National Park", "Trilhas"]
    },
    {
      id: "5",
      name: "Roça Monte Café",
      description: "A história e o aroma do melhor café do mundo nas montanhas",
      image: "☕",
      rating: 4.7,
      highlights: ["Museu do Café", "Degustação", "História Colonial"]
    },
    {
      id: "6",
      name: "Boca do Inferno",
      description: "Espetáculo natural onde as ondas batem com força nos canais de rocha",
      image: "🌊",
      rating: 4.5,
      highlights: ["Cascata", "Fenômeno Natural", "Geologia"]
    }
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(destinations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDestinations(items);
  };

  const [mostrarPasseios, setMostrarPasseios] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === "#passeios") {
        setMostrarPasseios(true);
      } else if (hash === "#destinos" || hash === "") {
        setMostrarPasseios(false);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    
    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  return (
    <section id="destinos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            {mostrarPasseios ? "Nossos Passeios Disponíveis" : "Os destinos mais incríveis de São Tomé e Príncipe"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            {mostrarPasseios 
              ? "Escolha entre nossos roteiros exclusivos com guias especializados"
              : "Arraste os cards para reordenar seus destinos favoritos"
            }
          </p>
          {!mostrarPasseios && (
            <Badge variant="outline" className="text-sm mb-4">
              💡 Dica: Arraste e solte para organizar
            </Badge>
          )}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setMostrarPasseios(false)}
              variant={mostrarPasseios ? "outline" : "default"}
              className={!mostrarPasseios ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Ver Destinos
            </Button>
            <Button
              onClick={() => setMostrarPasseios(true)}
              variant={mostrarPasseios ? "default" : "outline"}
              className={mostrarPasseios ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              Ver Passeios
            </Button>
          </div>
        </motion.div>

        {mostrarPasseios ? (
          <PasseiosCards />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="destinations">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {destinations.map((destination, index) => (
                    <Draggable 
                      key={destination.id} 
                      draggableId={destination.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`transform transition-all duration-200 ${
                              snapshot.isDragging ? 'rotate-2 shadow-2xl z-50' : 'hover:shadow-lg'
                            }`}
                          >
                          <Card className="h-full cursor-grab active:cursor-grabbing">
                            <CardContent className="p-6">
                              <div className="text-center mb-4">
                                <div className="text-4xl mb-3">{destination.image}</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                  {destination.name}
                                </h3>
                                <div className="flex items-center justify-center gap-1 mb-3">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{destination.rating}</span>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                {destination.description}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>Principais atrações:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {destination.highlights.map((highlight, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {highlight}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </section>
  );
}