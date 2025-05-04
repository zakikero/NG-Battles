import { ItemTypes, TileTypes } from '@common/tile-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tile extends Document {
    @Prop({ required: true })
    idx: number;

    @Prop({ required: false })
    tileType: TileTypes;

    @Prop({ required: false })
    item: ItemTypes;

    @Prop({ required: true })
    hasPlayer: boolean;
}

export const tileSchema = SchemaFactory.createForClass(Tile);
