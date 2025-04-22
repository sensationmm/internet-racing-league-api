import mongoose, { Schema } from 'mongoose';

export interface ILeaderboard {
  position: number;
  userId: string;
  points: number;
}

const leaderboardSchema = new Schema<ILeaderboard>(
  {
    position: { 
      type: Number, 
      required: true, 
    },
    userId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    points: { 
      type: Number, 
      required: true, 
    },
  },
  { 
    timestamps: true 
  }
);


export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', leaderboardSchema);