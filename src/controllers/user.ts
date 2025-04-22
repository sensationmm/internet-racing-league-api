import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUserInput } from '../models/User';
import { createCustomError } from "../utils/error";
import { EmailService } from "../services/email";
import crypto from "crypto";

export class UserController {

  static async getAllUsers() {
    const users = await User.find({});
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      surname: user.surname,
    }))
  }

  static getUserId(req: Request): string {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || '';
    const decoded = jwt.verify(token, config.jwt.secret) as unknown as { userId: string };
    return decoded.userId;
  }

  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, surname, email, password }: IUserInput = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'User already exists',
        });
        return;
      }

      // Verify SMTP connection
      const isEmailServiceWorking = await EmailService.verifyConnection();
      if (!isEmailServiceWorking) {
        res.status(500).json({
          status: 'error',
          message: 'Email service is not available. Please try again later.',
        });
        return;
      }

      // Generate verification token and hash password
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

      // Create new user
      const user = await User.create({
        name,
        surname,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });


      try {
        // Send verification email
        await EmailService.sendVerificationEmail(email, name, verificationToken);


        res.status(201).json({
          status: 'success',
          message: 'Registration successful. Please check your email to verify your account.',
        });
      } catch (emailError) {
        // If email fails, mark user as requiring email verification retry
        console.error('Failed to send verification email:', emailError);
        await User.findByIdAndUpdate(user._id, {
          $set: {
          emailVerificationFailed: true
          }
        });

        res.status(201).json({
          status: 'warning',
          message: 'Account created but verification email could not be sent. Please contact support.',
          userId: user._id
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async reauth(req:Request, res: Response):Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';

      const decoded = jwt.verify(token, config.jwt.secret, function(err, decoded) { // as { userId: string, message:string }
        if (err) {
          res.status(500).json({
            status: "error",
            message: err.message,
          });
          return;
        }

        return decoded;
      });

      if(decoded !== undefined) {
        const user = await User.findById((decoded as unknown as { userId: string, message:string }).userId);
        if (!user) {
          res.status(401).json({
            status: "error",
            message: "User not found",
          });
          return;
        }

        const secret = config.jwt.secret as jwt.Secret;
        const options = { 
          expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] 
        };

        const newToken = jwt.sign({ userId: user._id }, secret, options);

        res.json({
          status: "success",
          token: newToken,
          user: {
            id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            bio: user.bio,
            phoneNumber: user.phoneNumber,
          },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
        return;
      }

      // Check if user is verified
      if (user.isVerified != true) {
        res.status(401).json({
          status: "error",
          message: "Verify Email",
        });
        return;
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if(isPasswordValid) {
        // Generate JWT Token
        const secret = config.jwt.secret as jwt.Secret;
        const options = { 
          expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] 
        };

        const token = jwt.sign({ userId: user._id }, secret, options);

        res.json({
          status: "success",
          token,
          user: {
            id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            bio: user.bio,
            phoneNumber: user.phoneNumber,
          },
        });
      } else {
        res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
      status: "error",
      message: "Internal server error",
      });
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      // Find user by verification token
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({
          status: "error",
          message: "Invalid or expired verification token",
        });
        return;
      }

      // Mark user as verified
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'No account found with that email',
      });
      return;
      }

      // Verify email service before proceeding
      const isEmailServiceWorking = await EmailService.verifyConnection();
      if (!isEmailServiceWorking) {
      res.status(500).json({
        status: 'error',
        message: 'Email service is not available. Please try again later.',
      });
      return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      try {
      // Send password reset email
      await EmailService.sendPasswordResetEmail(email, user.name, resetToken);

      res.json({
        status: 'success',
        message: 'Password reset instructions sent to your email',
      });
      } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);

      // Reset the token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(500).json({
        status: 'error',
        message: 'Failed to send password reset email. Please try again later.',
      });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user by reset token
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
      res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token",
      });
      return;
      }

      // Hash new password and save
      const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
      );
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
      status: "success",
      message: "Password reset successfully",
      });
    } catch (error) {
      res.status(500).json({
      status: "error",
      message: "Internal server error",
      });
    }
  }

  static async edit(req: Request, res: Response): Promise<void> {
    try {
      const userId = await UserController.getUserId(req);

      const { name, surname, email, bio, phoneNumber }: IUserInput = req.body;

      // Check user exists
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User no found',
        });
        return;
      }

      //check email unique
      if(email !== user.email) {
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
          res.status(400).json({
            status: 'error',
            message: 'Email address already in use',
          });
        } else {
          user.email = email;
        }
      }

      // Update details
      if(name !== user.name) user.name = name;
      if(surname !== user.surname) user.surname = surname;
      if(bio !== user.bio) user.bio = bio;
      if(phoneNumber !== user.phoneNumber) user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        status: 'success',
        message: 'Account details edited successfully',
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}