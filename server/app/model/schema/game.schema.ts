import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Tile, tileSchema } from './tile.schema';

@Schema()
export class Game extends Document {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    gameName: string;

    @Prop({ required: true })
    gameDescription: string;

    @Prop({ required: true })
    mapSize: string;

    @Prop({ type: [tileSchema], required: true })
    map: Tile[];

    @Prop({ required: true })
    gameType: string;

    @Prop({ required: true })
    isVisible: boolean;

    @Prop({ required: true })
    creationDate: string;

    @Prop({ required: true })
    lastModified: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
