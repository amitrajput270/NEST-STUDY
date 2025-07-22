import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Post } from './post.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    age: number;

    // Virtual populate for posts
    posts?: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual populate for posts
UserSchema.virtual('posts', {
    ref: 'Post',
    localField: 'id',
    foreignField: 'userId',
    justOne: false
});

