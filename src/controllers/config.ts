import { Request, Response } from "express";
import { tiers, levels } from "../config/tiers";
import { points } from "../config/points";
import { Events } from "../models/Event";

export class ConfigController {
  static async test(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      status: 'success',
      message: 'Config Route available',
    });
  }

  static async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const topLevel = levels.slice().reverse()[0];
      const maxLevels = topLevel.level;
      const maxPoints = topLevel.points;

      const currentEvent = await Events.findOne({eventDate: { $lt: new Date() } }).sort('eventDate');
      const nextEvent = await Events.findOne({eventDate: { $gte: new Date() } }).sort('eventDate');

      res.status(200).json({
        status: 'success',
        message: 'Config retrieved successfully',
        body: {
          maxLevels,
          maxPoints,
          pointsValue: points,
          events: { current: currentEvent, next: nextEvent },
          tiers,
          levels
        }
      });
    } catch (error) {
      console.error('Config getConfig error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error getting Config',
      });
    }
  }
}