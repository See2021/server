// user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
    private readonly jwtSecret: string = 'accessKey';  // Set your secret key

    constructor(private prisma: PrismaService) { }

    async createUser(data: Omit<User, 'created_at'>): Promise<{ user: User; token: string } | null> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { email: data.email },
                ],
            },
        });

        if (existingUser) {
            return null;
        }

        const currentDate = new Date();
        const userData: User = {
            ...data,
            created_at: currentDate,
            password_hash: await bcrypt.hash(data.password_hash, 10),
        };

        const newUser = await this.prisma.user.create({
            data: userData,
        });

        const token = this.generateToken(newUser);

        return { user: newUser, token };
    }

    private generateToken(user: User): string {
        const payload = {
            user_id: user.user_id,
            username: user.username,
            user_role: user.user_role,
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
    }

    async getAllUser(): Promise<User[]> {
        return this.prisma.user.findMany()
    }

    async getUser(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { user_id: Number(id) } })
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async updateUser(id: number, data: User): Promise<User> {
        if (data.password_hash) {
            data.password_hash = await bcrypt.hash(data.password_hash, 10);
        }
        const prismaData = {
            ...data,
            password_hash: data.password_hash
                ? await bcrypt.hash(data.password_hash, 10)
                : undefined,
        };
        console.log('Prisma Data:', prismaData);
        return this.prisma.user.update({
            where: { user_id: Number(id) },
            data: prismaData,
        });
    }

    async deleteUser(id: number): Promise<User> {
        return this.prisma.user.delete({
            where: { user_id: Number(id) }
        })
    }

    async loginUser(credentials: { username: string; password: string }): Promise<{ user: User; token: string } | null> {
        const { username, password } = credentials;
        const user = await this.prisma.user.findUnique({ where: { username } });

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return null;
        }

        const token = this.generateToken(user);

        return { user, token };
    }

    async getUserFarmsByUsername(username: string): Promise<any[]> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        if (!user) {
            return [];
        }

        return this.prisma.userFarmTable.findMany({
            where: {
                user_id: user.user_id,
            },
            include: {
                farm: true,
            },
        });
    }
}
