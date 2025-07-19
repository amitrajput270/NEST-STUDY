import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

enum DatabaseType {
    MySQL = 'mysql',
    MongoDB = 'mongodb',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsEnum(DatabaseType)
    DB_TYPE: DatabaseType;

    // MongoDB config
    @IsString()
    MONGODB_URI: string;

    @IsString()
    MONGODB_DATABASE_NAME: string;

    // MySQL config
    @IsString()
    MYSQL_HOST: string;

    @IsNumber()
    MYSQL_PORT: number;

    @IsString()
    MYSQL_USER: string;

    @IsString()
    MYSQL_PASSWORD: string;

    @IsString()
    MYSQL_DATABASE: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToClass(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
