import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const PostSchema = SchemaFactory.createForClass(Post);
