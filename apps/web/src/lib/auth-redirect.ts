/**
 * Utilitário para gerenciar redirecionamentos baseados em user_type
 */

export type UserType = "admin" | "guia" | "cliente";

/**
 * Retorna a rota do dashboard baseado no tipo de usuário
 */
export function getDashboardRoute(userType: UserType | undefined): string {
  if (!userType) {
    console.warn("⚠️ [getDashboardRoute] UserType não fornecido, redirecionando para home");
    return "/";
  }

  const routes: Record<UserType, string> = {
    admin: "/admin",
    guia: "/guia",
    cliente: "/cliente",
  };

  const route = routes[userType];

  if (!route) {
    console.warn(`⚠️ [getDashboardRoute] UserType desconhecido: ${userType}`);
    return "/";
  }

  console.log(`✅ [getDashboardRoute] ${userType} → ${route}`);
  return route;
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
export function canAccessRoute(
  userType: UserType | undefined,
  allowedTypes: UserType[]
): boolean {
  if (!userType) {
    console.warn("⚠️ [canAccessRoute] UserType não fornecido");
    return false;
  }

  const hasAccess = allowedTypes.includes(userType);

  if (!hasAccess) {
    console.log(`⛔ [canAccessRoute] ${userType} não tem acesso. Permitidos: ${allowedTypes.join(", ")}`);
  } else {
    console.log(`✅ [canAccessRoute] ${userType} tem acesso`);
  }

  return hasAccess;
}

/**
 * Retorna o nome legível do tipo de usuário
 */
export function getUserTypeLabel(userType: UserType | undefined): string {
  if (!userType) return "Usuário";

  const labels: Record<UserType, string> = {
    admin: "Administrador",
    guia: "Guia",
    cliente: "Cliente",
  };

  return labels[userType] || "Usuário";
}
