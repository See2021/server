import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Farm } from './farm.model';
import { Disease, Prediction, Prisma, Tree } from '@prisma/client';
import * as fs from 'fs/promises';

@Injectable()
export class FarmService {
    constructor(private prisma: PrismaService) { }

    async getAllFarm(): Promise<Farm[]> {
        return this.prisma.farm.findMany()
    }

    async getFarm(id: number): Promise<Farm | null> {
        return this.prisma.farm.findUnique({ where: { id: Number(id) } })
    }

    async createFarm(data: Farm, imagePath?: string): Promise<Farm> {
        const farmData = { ...data, farm_photo: imagePath };

        return this.prisma.farm.create({
            data: farmData,
        });
    }

    async updateFarmImage(id: number, imagePath: string): Promise<Farm> {
        return this.prisma.farm.update({
            where: { id: Number(id) },
            data: { farm_photo: imagePath },
        })
    }

    async updateFarm(id: number, updateData: Partial<Farm>, imagePath?: string): Promise<Farm> {
        const existingFarm = await this.prisma.farm.findUnique({
            where: { id: Number(id) },
        });

        if (!existingFarm) {
            throw new NotFoundException(`Farm with ID ${id} not found`);
        }

        // Check if imagePath is provided, if yes, update farm_photo
        if (imagePath) {
            const oldImagePath = `./${existingFarm.farm_photo}`;

            try {
                await fs.unlink(oldImagePath);
            } catch (error) {
                console.error(`Error deleting old image file: ${error.message}`);
            }

            updateData.farm_photo = imagePath;
        }

        return this.prisma.farm.update({
            where: { id: Number(id) },
            data: updateData,
        });
    }

    async deleteFarm(id: number): Promise<Farm> {
        const farm = await this.prisma.farm.findUnique({ where: { id: Number(id) } });
        if (!farm) {
            throw new NotFoundException(`Farm with ID ${id} not found`);
        }

        if (farm.farm_photo) {
            const imagePath = `./${farm.farm_photo}`;
            await fs.unlink(imagePath).catch((err) => console.error(err));
        }

        await this.prisma.tree.deleteMany({
            where: { farm_id: farm.id },
        });

        await this.prisma.prediction.deleteMany({
            where: { farm_id: farm.id },
        });

        await this.prisma.userFarmTable.deleteMany({
            where: { farm_id: farm.id },
        });

        await this.prisma.disease.deleteMany({
            where: { farm_id: farm.id },
        });

        return this.prisma.farm.delete({
            where: { id: Number(id) }
        });
    }

    // async getAllTreesByFarmId(farm_id: number): Promise<Tree[]> {
    //     return this.prisma.tree.findMany({
    //         where: {
    //             farm_id: farm_id,
    //         },
    //     });
    // }

    async getAllTreesByFarmId(farm_id: number): Promise<Tree[]> {
        return this.prisma.tree.findMany({
            where: {
                farm_id: farm_id,
            },
            include: {
                treePhotos: true,
            },
        });
    }

    async getAllPredictByFarmId(farm_id: number): Promise<Prediction[]> {
        return this.prisma.prediction.findMany({
            where: {
                farm_id: farm_id,
            },
        });
    }

    async getPredictByFarmAndTreeId(farm_id: number, tree_id: number): Promise<Prediction[]> {
        return this.prisma.prediction.findMany({
            where: {
                farm_id: farm_id,
                tree_id: tree_id,
            },
        });
    }

    async getAllDiseaseByFarmId(farm_id: number): Promise<Disease[]> {
        return this.prisma.disease.findMany({
            where: {
                farm_id: farm_id,
            },
        });
    }

    async getDiseaseByFarmAndTreeId(farm_id: number, tree_id: number): Promise<Disease[]> {
        return this.prisma.disease.findMany({
            where: {
                farm_id: farm_id,
                tree_id: tree_id,
            },
        });
    }

    async createFarmWithUser(username: string, farmData: Omit<Farm, 'id'>, imagePath?: string): Promise<Farm> {
        const user = await this.prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user) {
            throw new Error(`User with username ${username} not found`);
        }

        const createdFarm = await this.prisma.farm.create({
            data: {
                ...farmData,
                farm_photo: imagePath,
                usersFarms: {
                    create: {
                        user_id: user.user_id,
                    },
                },
            },
            include: {
                usersFarms: true,
            },
        });

        return createdFarm;
    }

    async getTotalCollectedTreesByUser(userId: number): Promise<{ totalCollectedTrees: number, farms: { farmId: number, totalCollectedTrees: number }[] }> {
        const userFarms = await this.prisma.userFarmTable.findMany({
            where: {
                user_id: userId,
            },
            include: {
                farm: {
                    include: {
                        trees: true,
                    },
                },
            },
        });

        const farmsResult: { farmId: number, totalCollectedTrees: number }[] = [];

        userFarms.forEach((userFarm) => {
            const totalCollectedTrees = userFarm.farm.trees.reduce((total, tree) => total + tree.tree_collected, 0);
            farmsResult.push({ farmId: userFarm.farm.id, totalCollectedTrees });
        });

        const totalCollectedTrees = farmsResult.reduce((total, farm) => total + farm.totalCollectedTrees, 0);

        return { totalCollectedTrees, farms: farmsResult };
    }

    async createTreeForFarm(
        farmId: number,
        data: Omit<Tree, 'id'>,
        treePhotoPath?: string,
    ): Promise<Tree> {
        const existingFarm = await this.prisma.farm.findUnique({
            where: { id: Number(farmId) },
        });

        if (!existingFarm) {
            throw new NotFoundException(`Farm with ID ${farmId} not found`);
        }

        const treeData = {
            ...data,
            tree_collected: parseInt(data.tree_collected as any),
            tree_ready: parseInt(data.tree_ready as any),
            tree_notReady: parseInt(data.tree_notReady as any),
        } as unknown as Prisma.TreeCreateInput;

        const farmIdInt = Number(farmId);

        return this.prisma.tree.create({
            data: {
                ...treeData,
                farm: { connect: { id: farmIdInt } },
                treePhotos: treePhotoPath
                    ? {
                        create: {
                            tree_photo_path: treePhotoPath,
                        },
                    }
                    : undefined,
            },
        });
    }

    async updateTree(
        treeId: number,
        updateData: Partial<Omit<Tree, 'id' | 'created_at' | 'tree_photo_path'>>,
        imagePath?: string,
    ): Promise<Tree> {
        const existingTree = await this.prisma.tree.findUnique({
            where: { id: Number(treeId) },
            include: { treePhotos: true },
        });

        if (!existingTree) {
            throw new NotFoundException(`Tree with ID ${treeId} not found`);
        }

        // Ensure that only valid fields are updated
        const allowedFields = ['tree_collected', 'tree_ready', 'tree_notReady'];
        const validUpdateData: Record<string, any> = {};

        for (const field of allowedFields) {
            if (field in updateData) {
                validUpdateData[field] = parseInt(updateData[field] as any);
            }
        }

        if (imagePath) {
            // Update existing TreePhoto
            const oldTreePhotoId = existingTree.treePhotos?.[0]?.id;

            if (oldTreePhotoId) {
                await this.prisma.treePhoto.update({
                    where: { id: oldTreePhotoId },
                    data: { tree_photo_path: imagePath },
                });
            } else {
                // Create a new TreePhoto if none exists
                validUpdateData['treePhotos'] = {
                    create: {
                        tree_photo_path: imagePath,
                    },
                };
            }

            // Remove old image file
            const oldImagePath = existingTree.treePhotos?.[0]?.tree_photo_path;
            if (oldImagePath) {
                const fullPath = `./${oldImagePath}`;
                await fs.unlink(fullPath);
            }
        }

        const numericTreeId = Number(treeId);
        return this.prisma.tree.update({
            where: { id: numericTreeId as number },
            data: validUpdateData,
        });
    }

    async deleteTree(treeId: number): Promise<void> {
        const existingTree = await this.prisma.tree.findUnique({
            where: { id: Number(treeId) },
            include: { treePhotos: true },
        });

        if (!existingTree) {
            throw new NotFoundException(`Tree with ID ${treeId} not found`);
        }

        // Remove tree photo file
        const treePhotoPath = existingTree.treePhotos?.[0]?.tree_photo_path;
        if (treePhotoPath) {
            const fullPath = `./${treePhotoPath}`;
            await fs.unlink(fullPath);
        }

        // Cascade delete related records (treePhotos)
        await this.prisma.tree.update({
            where: { id: Number(treeId) },
            data: {
                treePhotos: {
                    deleteMany: {},
                },
            },
        });

        // Delete the tree
        await this.prisma.tree.delete({
            where: { id: Number(treeId) },
        });
    }
}
