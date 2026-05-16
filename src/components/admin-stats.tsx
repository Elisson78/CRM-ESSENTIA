"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {changeType === "increase" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={`text-sm ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change > 0 ? "+" : ""}{change}% este mês
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const AdminStats: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Apenas executar no cliente para evitar problemas de hidratação
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: "Usuários Online",
      value: isOnline ? "12" : "0",
      change: 15,
      changeType: "increase" as const,
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
    },
    {
      title: "Receita Hoje",
      value: "€ 2.450,00",
      change: 8,
      changeType: "increase" as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-green-600",
    },
    {
      title: "Agendamentos Hoje",
      value: "8",
      change: -3,
      changeType: "decrease" as const,
      icon: <Calendar className="h-6 w-6" />,
      color: "text-orange-600",
    },
    {
      title: "Sistema Status",
      value: isOnline ? "Online" : "Offline",
      change: 0,
      changeType: "increase" as const,
      icon: <Activity className="h-6 w-6" />,
      color: isOnline ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status em tempo real */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            Sistema {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {isClient && currentTime ? currentTime.toLocaleTimeString("pt-BR") : "--:--:--"}
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default AdminStats;

