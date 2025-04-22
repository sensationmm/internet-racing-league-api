import { Request, Response } from "express";
import { IPointsType, Points } from "../models/Points";
import { currentEventId } from "./engagement";
import { UserController } from "./user";
import { levels, tiers } from "../config/tiers";
import { points } from "../config/points";
import { ILeaderboard, Leaderboard } from "../models/Leaderboard";
import { sortObjectValues } from "../utils/object";
import { User } from "../models/User";

export class PointsController {
  static async test(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      status: 'success',
      message: 'Points Route available',
    });
  }

  static async myPoints(req: Request, res: Response): Promise<void> {
    try {
      const userId = await UserController.getUserId(req);
      
      const [myPoints, watchTimes] = await Promise.all([
        await Points.find({
          userId: userId
        }),
        await Points.find({
          userId: userId,
          type: 'stream'
        })
      ]);

      const reversedLevels = levels.slice().reverse();
      const myPointsTotal = myPoints.reduce((acc,curr) => acc + curr.value, 0);
      const myWatchTime = watchTimes.reduce((acc,curr) => acc + curr.value / points.watch, 0);
      const myLevelIndex = reversedLevels.findIndex(level => level.points < myPointsTotal) ?? 0;
      const myLevel = reversedLevels[myLevelIndex];
      const myTier = tiers.slice().reverse().find(tier => tier.level < myLevel?.level);

      res.status(200).json({
        status: 'success',
        message: 'Points retrieved successfully',
        body: {
          total: myPointsTotal,
          correctAt: new Date(),
          level: myLevel.level,
          tier: myTier?.label,
          pointsToNextLevel: reversedLevels[myLevelIndex - 1].points - myPointsTotal,
          minutesWatched: myWatchTime
        }
      });
    } catch (error) {
      console.error('Points myPoints error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error getting Points',
      });
    }
  }

  static async award(value: number, type: IPointsType, userId: string) {
    try {
      if(value > 0) {
        const points = await Points.create({
          userId: userId,
          eventId: currentEventId,
          value,
          type
        });

      // Check points here
      // Reward here if applicable

        return points;
      } else {
        return { value: 0 }
      }
    } catch (error) {
      console.error('Points award error:', error);
    }
  }

  static async generateLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      await Leaderboard.deleteMany({});

      const leaderboard: { [key:string]: number} = {};

      const allPoints = await Points.find({
        eventId: currentEventId
      });

      allPoints.forEach(point => {
        if(leaderboard.hasOwnProperty(point.userId)) {
          const current = leaderboard[point.userId];
          leaderboard[point.userId] = current + point.value;
        } else {
          leaderboard[point.userId] = point.value;
        }
      });
      const rankedLeaderboard = sortObjectValues(leaderboard);

      await Promise.all(Object.keys(rankedLeaderboard).map(async (entry,count) => await Leaderboard.create({
        position: count+1,
        userId: entry,
        points: Object.values(rankedLeaderboard)[count]
      })));

      res.status(200).json({
        status: 'success',
        message: 'Leaderboard generated',
      });;
    } catch (error) {
      console.error('Points generateLeaderboard error:', error);
    }
  }

  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = await UserController.getUserId(req);
      
      const [topTen, myEntry, allUsers] = await Promise.all([
        await Leaderboard.find({}).sort('position').limit(10),
        await Leaderboard.findOne({
          userId: userId,
        }),
        await UserController.getAllUsers()
      ]);

      console.log('users',allUsers, topTen)

      res.status(200).json({
        status: 'success',
        message: 'Leaderboard retrieved successfully',
        body: {
          topTen: [...topTen.map(entry => ({
            ...entry.toObject(),
            user: allUsers.find(user => user._id.toString() === entry.userId)
          }))],
          me: myEntry
        }
      });
    } catch (error) {
      console.error('Points myPoints error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error getting Points',
      });
    }
  }
}