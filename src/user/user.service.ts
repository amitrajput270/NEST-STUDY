import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    userRecords = [
        {
            'id': 1,
            'name': 'John Doe',
            'email': 'john@gmail.com',
            'age': 30
        }
    ];

    userList(): object | string {
        return this.userRecords.length > 0 ? this.userRecords : 'No users found';
    }

    getUser(id: string): object | string {
        const user = this.userRecords.find(user => user.id === +id);
        return user ? user : `User with id ${id} not found`;
    }

    createUser(body: CreateUserDto): any {
        if (body && body.name && body.email && body.age) {
            const newUser = {
                id: this.userRecords.length + 1,
                ...body,
            };
            this.userRecords.push(newUser);
            return newUser
        }
        return 'Invalid user data';
    }

    updateUser(body: CreateUserDto, id: any): object | string {
        const userIndex = this.userRecords.findIndex(user => user.id === +id);
        if (userIndex > -1) {
            this.userRecords[userIndex] = { ...this.userRecords[userIndex], ...body };
            return this.userRecords[userIndex];
        }
        return `User with id ${id} not found`;
    }

    deleteUser(id: string): string {
        const userIndex = this.userRecords.findIndex(user => user.id === +id);
        if (userIndex > -1) {
            this.userRecords.splice(userIndex, 1);
            return `User with id ${id} deleted successfully`;
        }
        return `User with id ${id} not found`;
    }
}
