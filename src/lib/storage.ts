// Storage implementation for web app using Prisma
import { prisma } from './prisma';

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UpsertUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

export class DatabaseStorage {
  async getUser(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user = await prisma.user.upsert({
      where: { id: userData.id },
      update: {
        ...userData,
        updatedAt: new Date(),
      },
      create: {
        ...userData,
        nome: `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() || 'Usuário',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const storage = new DatabaseStorage();