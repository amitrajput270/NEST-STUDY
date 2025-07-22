export class AuthResponseDto {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string = 'Bearer';
    user: {
        id: number;
        name: string;
        email: string;
        age: number;
    };
}
