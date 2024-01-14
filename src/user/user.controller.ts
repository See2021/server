import { Body, Controller, Get, Param, Post, Put, Req, Res, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { User } from './user.model';

@Controller('api/v1/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Post()
    async createUser(@Req() request: Request, @Res() response: Response, @Body() postData: User): Promise<Response> {
        try {
            const result = await this.userService.createUser(postData);

            if (result) {
                return response.status(201).json({
                    status: 'Created',
                    message: 'User was created successfully',
                    result: result.user,  // Access 'user' property from the result
                    token: result.token,  // Access 'token' property from the result
                });
            } else {
                return response.status(409).json({
                    status: 'Conflict',
                    message: 'Username or email already exists',
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error creating user',
            });
        }
    }

    @Get()
    async getAllUser(@Req() request: Request, @Res() response: Response): Promise<Response> {
        try {
            const result = await this.userService.getAllUser();

            if (result.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: 'Successfully fetched users',
                    result: result,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: 'No users found',
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error fetching users',
            });
        }
    }

    @Get(':id')
    async getUser(@Req() request: Request, @Res() response: Response, @Param('id') id: number): Promise<Response> {
        try {
            const result = await this.userService.getUser(id);

            if (result) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully retrieved user with ID ${id}`,
                    result: result,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `User with ID ${id} not found`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error retrieving user',
            });
        }
    }

    @Get('username/:name')
    async getUserByUsername(@Req() request: Request, @Res() response: Response, @Param('name') username: string): Promise<Response> {
        try {
            const result = await this.userService.getUserByUsername(username);

            if (result) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully retrieved user with username ${username}`,
                    result: result,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `User with username ${username} not found`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error retrieving user by username',
            });
        }
    }

    @Put(':id')
    async updateUser(@Req() request: Request, @Res() response: Response, @Param('id') id: number, @Body() postData: User): Promise<Response> {
        try {
            const result = await this.userService.updateUser(id, postData);

            if (result) {
                return response.status(200).json({
                    status: 'Updated',
                    message: `User with ID ${id} updated successfully`,
                    result: result,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `User with ID ${id} not found`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error updating user',
            });
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<{ message: string }> {
        try {
            const result = await this.userService.deleteUser(id);

            if (result) {
                return { message: `User with ID ${id} deleted successfully` };
            } else {
                return { message: `User with ID ${id} not found` };
            }
        } catch (error) {
            console.error(error);
            return { message: 'Error deleting user' };
        }
    }

    @Post('login')
    async loginUser(@Req() request: Request, @Res() response: Response, @Body() credentials: { username: string; password: string }): Promise<Response> {
        try {
            const result = await this.userService.loginUser(credentials);

            if (result) {
                return response.status(200).json({
                    status: 'Success',
                    message: 'User logged in successfully',
                    result: result.user,
                    token: result.token,
                });
            } else {
                return response.status(401).json({
                    status: 'Unauthorized',
                    message: 'Invalid username or password',
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error logging in',
            });
        }
    }

    @Get(':name/farms')
    async getUserFarmsByUsername(@Req() request: Request, @Res() response: Response, @Param('name') username: string): Promise<Response> {
        try {
            const farms = await this.userService.getUserFarmsByUsername(username);

            if (farms.length > 0) {
                return response.status(200).json({
                    status: 'Ok!',
                    message: `Successfully fetched farms for user with username ${username}`,
                    result: farms,
                });
            } else {
                return response.status(404).json({
                    status: 'Not Found',
                    message: `No farms found for user with username ${username}`,
                });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                status: 'Internal Server Error',
                message: 'Error fetching user farms',
            });
        }
    }
}
