import { Prisma } from "@prisma/client";

export class Farm implements Prisma.FarmCreateInput {
    id: number;
    farm_name: string;
    farm_location: string;
    farm_province: string;
    farm_durian_species: string;
    farm_photo?: string | null;
    farm_status: boolean;
    farm_pollination_date: Date;
    farm_tree: number;
    farm_space: number;
    latitude: number;
    longtitude: number;
    duian_amount: number;
}