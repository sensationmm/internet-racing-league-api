import { Request, Response } from "express";
import { Stream } from "../models/Stream";
import { PointsController } from "./points";
import { dateDifference } from "../utils/date";
import { points } from "../config/points";
import { UserController } from "./user";

export const currentEventId = '6800421052b3e09c7882a4a7';

export class EngagementController<T> {
  static async test(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      status: 'success',
      message: 'Engagement Route available',
    });
  }

  static async startStream(req: Request, res: Response): Promise<void> {
    try {
      // Check stream not active
      const userId = await UserController.getUserId(req);
      const checkStream = await Stream.findOne({userId});
      if (checkStream) {
        res.status(404).json({
          status: 'error',
          message: 'Stream already active',
        });
        return;
      }

      const newStream = await Stream.create({
        userId: userId,
        eventId: currentEventId,
        streamStart: new Date()
      });

      res.status(200).json({
        status: 'success',
        message: 'Stream started',
        body: newStream
      });
    } catch (error) {
      console.error('Stream create error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error creating Stream',
      });
    }
  }

  static async stopStream(req: Request, res: Response): Promise<void> {
    try {
      const userId = await UserController.getUserId(req);
      // Check stream exists
      const checkStream = await Stream.findOne({userId: userId});
      if (!checkStream) {
        res.status(404).json({
          status: 'error',
          message: 'Stream not active',
        });
        return;
      }

      const stopTime = new Date();
      const startTime = checkStream.streamStart;
      const duration = dateDifference(startTime,stopTime,'minutes');
      
      const pointsAward = await PointsController.award(duration * points.watch, 'stream', userId);

      await checkStream.deleteOne();

      res.status(200).json({
        status: 'success',
        message: 'Stream stopped',
        body: {
          start: startTime,
          stop: stopTime,
          duration: duration,
          points: pointsAward
        }
      });
    } catch (error) {
      console.error('Stream create error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error stopping Stream',
      });
    }
  }

  static async like(req: Request, res: Response): Promise<void> {
    try {
      // @TODO: make subsequent likes 0 points?
      const pointsAward = await PointsController.award(points.like, 'like', UserController.getUserId(req));

      res.status(200).json({
        status: 'success',
        message: 'Like successful',
        body: {
          points: pointsAward
        }
      });
    } catch (error) {
      console.error('Like error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error adding Like',
      });
    }
  }

  static async share(req: Request, res: Response): Promise<void> {
    try {
      const pointsAward = await PointsController.award(points.share, 'share', UserController.getUserId(req));

      res.status(200).json({
        status: 'success',
        message: 'Share successful',
        body: {
          points: pointsAward
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error adding Share',
      });
    }
  }

  static async comment(req: Request, res: Response): Promise<void> {
    try {
      const pointsAward = await PointsController.award(points.comment, 'comment', UserController.getUserId(req));

      res.status(200).json({
        status: 'success',
        message: 'Comment successful',
        body: {
          points: pointsAward
        }
      });
    } catch (error) {
      console.error('Comment error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error adding Comment',
      });
    }
  }
}