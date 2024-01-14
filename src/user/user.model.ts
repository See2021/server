import { Prisma } from "@prisma/client";

export class User implements Prisma.UserCreateInput {
    user_id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    user_role: number;
}