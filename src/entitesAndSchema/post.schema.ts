import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PostDocument = Post & Document;

@Schema()
export class Post {
    @Prop({ required: true })
    userId: number;

    @Prop({ required: true, maxlength: 255 })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now, select: false })
    updatedAt: Date;

    // Virtual populate for user
    user?: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Add virtual populate for user
PostSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'id',
    justOne: true
});
