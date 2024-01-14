import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FarmService } from './farm.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Farm } from './farm.model';
import { Tree } from '@prisma/client';

@Controller('api/v1/farm')
export class FarmController {
    constructor(private readonly farmService: FarmService) { }

    @Get()
    async getAllFarm(@Req() request: Request, @Res() response: Response): Promise<Response> {
        try {
            const result = await this.farmService.getAllFarm();

            if (result.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: 'Successfully fetched farms',
                    result: result,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: 'No farms found',
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error fetching farms',
            });
        }
    }

    @Post()
    @UseInterceptors(FileInterceptor('farm_photo'))
    async postFarm(
        @Req() request: Request,
        @Res() response: Response,
        @Body() postData: Farm,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Response> {
        try {
            let imagePath: string | undefined;

            if (file) {
                imagePath = `/public/${file.originalname}`;
            }

            if (request.body.farm_status) {
                postData.farm_status = request.body.farm_status === '1' ? true : false;
            }

            postData.farm_tree = typeof postData.farm_tree === 'string' ? parseInt(postData.farm_tree) : postData.farm_tree;
            postData.farm_space = typeof postData.farm_space === 'string' ? parseInt(postData.farm_space) : postData.farm_space;
            postData.latitude = typeof postData.latitude === 'string' ? parseFloat(postData.latitude) : postData.latitude;
            postData.longtitude = typeof postData.longtitude === 'string' ? parseFloat(postData.longtitude) : postData.longtitude;
            postData.duian_amount = typeof postData.duian_amount === 'string' ? parseInt(postData.duian_amount) : postData.duian_amount;
            const result = await this.farmService.createFarm(postData, imagePath);

            return response.status(201).json({
                status: 'Created',
                message: `Farm ID ${result.id} was created successfully`,
                result: result,
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error creating farm',
            });
        }
    }

    @Post(':username')
    @UseInterceptors(FileInterceptor('farm_photo'))
    async postFarm2(
        @Req() request: Request,
        @Res() response: Response,
        @Body() postData: Farm,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Response> {
        try {
            let imagePath: string | undefined;

            if (file) {
                imagePath = `/public/${file.filename}`;
            }

            if (request.body.farm_status) {
                postData.farm_status = request.body.farm_status === '1' ? true : false;
            }

            postData.farm_tree = typeof postData.farm_tree === 'string' ? parseInt(postData.farm_tree) : postData.farm_tree;
            postData.farm_space = typeof postData.farm_space === 'string' ? parseInt(postData.farm_space) : postData.farm_space;
            postData.latitude = typeof postData.latitude === 'string' ? parseFloat(postData.latitude) : postData.latitude;
            postData.longtitude = typeof postData.longtitude === 'string' ? parseFloat(postData.longtitude) : postData.longtitude;
            postData.duian_amount = typeof postData.duian_amount === 'string' ? parseInt(postData.duian_amount) : postData.duian_amount;

            const username = request.params.username;

            const result = await this.farmService.createFarmWithUser(username, postData, imagePath);

            return response.status(201).json({
                status: 'Created',
                message: `Farm ID ${result.id} was created successfully`,
                result: result,
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error creating farm',
            });
        }
    }

    @Post('upload-image/:id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file, @Param('id') id: number) {
        const imagePath = `/public/${file.originalname}`;
        await this.farmService.updateFarmImage(id, imagePath);
        return { imagePath, message: 'Image uploaded successfully' };
    }

    @Get(':id')
    async getFarm(@Req() request: Request, @Res() response: Response, @Param('id') id: number): Promise<Response> {
        try {
            const result = await this.farmService.getFarm(id);

            if (result) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully retrieved farm with ID ${id}`,
                    result: result,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `Farm with ID ${id} not found`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error retrieving farm',
            });
        }
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('farm_photo'))
    async updateFarm(
        @Req() request: Request,
        @Res() response: Response,
        @Param('id') id: number,
        @Body() updateData: Partial<Farm>, // Use Partial<Farm> to allow updating only specific fields
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Response> {
        try {
            let imagePath: string | undefined;

            if (file) {
                imagePath = `/public/${file.filename}`;
            }

            if (updateData.farm_status !== undefined) {
                updateData.farm_status = typeof updateData.farm_status === 'string'
                    ? updateData.farm_status === '1'
                    : updateData.farm_status;
            }
            updateData.farm_tree = typeof updateData.farm_tree === 'string' ? parseInt(updateData.farm_tree) : updateData.farm_tree;
            updateData.farm_space = typeof updateData.farm_space === 'string' ? parseInt(updateData.farm_space) : updateData.farm_space;
            updateData.latitude = typeof updateData.latitude === 'string' ? parseFloat(updateData.latitude) : updateData.latitude;
            updateData.longtitude = typeof updateData.longtitude === 'string' ? parseFloat(updateData.longtitude) : updateData.longtitude;
            updateData.duian_amount = typeof updateData.duian_amount === 'string' ? parseInt(updateData.duian_amount) : updateData.duian_amount;

            const result = await this.farmService.updateFarm(id, updateData, imagePath);

            return response.status(200).json({
                status: 'Updated',
                message: `Farm with ID ${id} updated successfully`,
                result: result,
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error updating farm',
            });
        }
    }

    @Delete(':id')
    async deleteFarm(@Param('id') id: number): Promise<{ message: string }> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result = await this.farmService.deleteFarm(id);

            return { message: `Farm with ID ${id} deleted successfully` };
        } catch (error) {
            console.error(error);
            return { message: 'Error deleting farm' };
        }
    }

    @Get(':id/predict')
    async getAllPredictByFarmId(@Req() request: Request, @Res() response: Response, @Param('id') id: string): Promise<Response> {
        try {
            const farmId = parseInt(id);
            const trees = await this.farmService.getAllPredictByFarmId(farmId);

            if (trees.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched prediction for Farm ID ${farmId}`,
                    result: trees,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No prediction found for Farm ID ${farmId}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: `Error fetching prediction for Farm ID ${id}`,
            });
        }
    }

    @Get(':id/disease')
    async getAllDiseaseByFarmId(@Req() request: Request, @Res() response: Response, @Param('id') id: string): Promise<Response> {
        try {
            const farmId = parseInt(id);
            const diseases = await this.farmService.getAllDiseaseByFarmId(farmId);

            if (diseases.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched diseases for Farm ID ${farmId}`,
                    result: diseases,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No diseases found for Farm ID ${farmId}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: `Error fetching diseases for Farm ID ${id}`,
            });
        }
    }

    // tree management
    @Get(':farmId/tree/:treeId/disease')
    async getDiseaseByFarmAndTreeId(@Req() request: Request, @Res() response: Response, @Param('farmId') farmId: string, @Param('treeId') treeId: string,): Promise<Response> {
        try {
            const parsedFarmId = parseInt(farmId);
            const parsedTreeId = parseInt(treeId);
            const diseases = await this.farmService.getDiseaseByFarmAndTreeId(parsedFarmId, parsedTreeId);

            if (diseases.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched diseases for Farm ID ${parsedFarmId} and Tree ID ${parsedTreeId}`,
                    result: diseases,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No diseases found for Farm ID ${parsedFarmId} and Tree ID ${parsedTreeId}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: `Error fetching diseases for Farm ID ${farmId} and Tree ID ${treeId}`,
            });
        }
    }

    // @Get(':id/trees')
    // async getAllTreesByFarmId(@Req() request: Request, @Res() response: Response, @Param('id') id: string): Promise<Response> {
    //     try {
    //         const farmId = parseInt(id);
    //         const trees = await this.farmService.getAllTreesByFarmId(farmId);

    //         if (trees.length > 0) {
    //             return response.status(200).json({
    //                 status: 'Ok!',
    //                 message: `Successfully fetched trees for Farm ID ${farmId}`,
    //                 result: trees,
    //             });
    //         } else {
    //             return response.status(404).json({
    //                 status: 'Not Found',
    //                 message: `No trees found for Farm ID ${farmId}`,
    //             });
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         return response.status(500).json({
    //             status: 'Internal Server Error',
    //             message: `Error fetching trees for Farm ID ${id}`,
    //         });
    //     }
    // }

    // controller.ts
    @Get(':id/trees')
    async getAllTreesByFarmId(@Req() request: Request, @Res() response: Response, @Param('id') id: string): Promise<Response> {
        try {
            const farmId = parseInt(id);
            const trees = await this.farmService.getAllTreesByFarmId(farmId);

            if (trees.length > 0) {
                const formattedTrees = trees.map(tree => ({
                    id: tree.id,
                    farm_id: tree.farm_id,
                    tree_collected: tree.tree_collected,
                    tree_ready: tree.tree_ready,
                    tree_notReady: tree.tree_notReady,
                    created_at: tree.created_at,
                    tree_photo_path: (tree as any)?.treePhotos?.[0]?.tree_photo_path || null,
                }));

                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched trees for Farm ID ${farmId}`,
                    result: formattedTrees,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No trees found for Farm ID ${farmId}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: `Error fetching trees for Farm ID ${id}`,
            });
        }
    }

    @Get('user/:userId/total')
    async getTotalCollectedTreesByUser(@Param('userId') userId: string, @Res() response: Response): Promise<Response> {
        try {
            const parsedUserId = parseInt(userId);
            const result = await this.farmService.getTotalCollectedTreesByUser(parsedUserId);

            if (result.totalCollectedTrees > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched total collected trees for user ${parsedUserId}`,
                    result: {
                        sumCollected: result.totalCollectedTrees,
                        farms: result.farms.map(farm => ({
                            farm_id: farm.farmId,
                            totalCollectedTrees: farm.totalCollectedTrees,
                        })),
                    }
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No farms found for user ${parsedUserId}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: `Error fetching total collected trees for user ${userId}`,
            });
        }
    }

    @Post(':farmId/tree')
    @UseInterceptors(FileInterceptor('tree_photo_path'))
    async postTree(
        @Req() request: Request,
        @Res() response: Response,
        @Param('farmId') farmId: number,
        @Body() postData: Tree,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Response> {
        try {
            let treePhotoPath: string | undefined;

            if (file) {
                treePhotoPath = `/public/tree/${file.filename}`;
            }

            const result = await this.farmService.createTreeForFarm(farmId, postData, treePhotoPath);

            return response.status(201).json({
                status: 'Created',
                message: `Tree ID ${result.id} was created successfully for Farm ID ${farmId}`,
                result: result,
            });
        } catch (error) {
            console.error(error);

            if (error instanceof NotFoundException && error.message.startsWith("Farm with ID")) {
                return response.status(404).json({
                    status: 'Not Found',
                    message: error.message,
                    error: 'Not Found',
                    statusCode: 404,
                });
            }

            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error creating tree for farm',
            });
        }
    }

    @Put('update/tree/:treeId')
    @UseInterceptors(FileInterceptor('tree_photo_path'))
    async updateTree(
        @Req() request: Request,
        @Res() response: Response,
        @Param('treeId') treeId: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateData: Partial<Omit<Tree, 'id' | 'created_at' | 'tree_photo_path'>>,
    ): Promise<Response> {
        try {
            let imagePath: string | undefined;

            if (file) {
                imagePath = `/public/tree/${file.filename}`;
            }

            const result = await this.farmService.updateTree(treeId, updateData, imagePath);

            return response.status(200).json({
                status: 'Success',
                message: `Tree ID ${result.id} updated successfully`,
                result: result,
            });
        } catch (error) {
            console.error(error);

            if (error instanceof NotFoundException && error.message.startsWith("Tree with ID")) {
                return response.status(404).json({
                    status: 'Not Found',
                    message: error.message,
                    error: 'Not Found',
                    statusCode: 404,
                });
            }

            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error updating tree',
            });
        }
    }

    @Delete('delete/tree/:treeId')
    async deleteTree(
        @Req() request: Request,
        @Res() response: Response,
        @Param('treeId') treeId: number,
    ): Promise<Response> {
        try {
            await this.farmService.deleteTree(treeId);

            return response.status(200).json({
                status: 'Success',
                message: `Tree with ID ${treeId} deleted successfully`,
            });
        } catch (error) {
            console.error(error);

            if (error instanceof NotFoundException && error.message.startsWith("Tree with ID")) {
                return response.status(404).json({
                    status: 'Not Found',
                    message: error.message,
                    error: 'Not Found',
                    statusCode: 404,
                });
            }

            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error deleting tree',
            });
        }
    }

    @Get(':farmId/tree/:treeId/predict')
    async getPredictByFarmAndTreeId(@Req() request: Request, @Res() response: Response, @Param('farmId') farmId: string, @Param('treeId') treeId: string,): Promise<Response> {
        try {
            const parsedFarmId = parseInt(farmId);
            const parsedTreeId = parseInt(treeId);
            const predictions = await this.farmService.getPredictByFarmAndTreeId(parsedFarmId, parsedTreeId);

            if (predictions.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched predictions for Farm ID ${parsedFarmId} and Tree ID ${parsedTreeId}`,
                    result: predictions,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No predictions found for Farm ID ${parsedFarmId} and Tree ID ${parsedTreeId}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: `Error fetching predictions for Farm ID ${farmId} and Tree ID ${treeId}`,
            });
        }
    }
}
