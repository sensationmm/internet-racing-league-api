import mongoose, { Schema } from 'mongoose';

export type IPointsType = 'stream' | 'like' | 'comment' | 'share';

export type IPointsAwards = {
  value: number;
  type: IPointsType;
  attr?: string | number;
};

export interface IPoints extends IPointsAwards {
  userId: string;
  eventId: string;
  createdAt: Date;
}

const pointsSchema = new Schema<IPoints>(
  {
    value: {
      type: Number,
      required: true, 
    },
    userId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    eventId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    type: {
      type: String,
      required: true,
    },
    attr: {
      type: String || Number,
    }
  },
  { 
    timestamps: true 
  }
);


export const Points = mongoose.model<IPoints>('Points', pointsSchema);