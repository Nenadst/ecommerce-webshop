// import bcrypt from 'bcrypt';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '@/entities/user/model/user.model';
import type { IUserDocument } from '@/entities/user/model/user.model';

interface Context {
  user?: IUserDocument;
}

// Helper: Send verification email (could also be in a separate util service)
async function sendVerificationEmail(user: IUserDocument) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP configuration is missing. Skipping email send.');
    return;
  }
  // Create a transporter for SMTP (using env vars for config)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false, // if using 587 (TLS), set secure false; for 465 set true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verifyLink = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${user.emailVerificationToken}`;
  //   const mailOptions = {
  //     from: process.env.EMAIL_FROM || '"Example Shop" <no-reply@example.com>',
  //     to: user.email,
  //     subject: 'Verify your Email - Example Shop',
  //     text: \`Hello,\n\nPlease verify your email address by clicking the link: ${verifyLink}\n\nIf you did not sign up, you can ignore this email.\`,
  //     html: \`<p>Hello,</p>
  //            <p>Please verify your email address by clicking the link below:</p>
  //            <p><a href="\${verifyLink}">Verify my email</a></p>
  //            <p>If you did not create an account, you can ignore this email.</p>\`
  //   };

  //   await transporter.sendMail(mailOptions);
}

// The resolver map
export const userResolvers = {
  Query: {
    // Fetch current user's info (must be authenticated)
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated.'); // Or throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      // context.user is already a Mongoose document (populated in Apollo context)
      return context.user;
    },
  },
  Mutation: {
    // User Registration
    registerUser: async (
      _parent: any,
      args: { input: { email: string; password: string; name?: string } },
      _context: Context
    ) => {
      const { email, password, name } = args.input;
      // Check if email already exists
      const existing = await User.findOne({ email });
      if (existing) {
        throw new Error('Email is already in use.');
      }
      // Create email verification token
      const emailToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Create new user (password will be hashed by pre-save hook in model)
      const newUser = new User({
        email,
        password, // plaintext for now; will be hashed by hook
        name,
        emailVerified: false,
        emailVerificationToken: emailToken,
        emailVerificationTokenExpires: tokenExpiry,
        twoFactorEnabled: false,
      });
      await newUser.save();

      // Send verification email (nodemailer)
      try {
        await sendVerificationEmail(newUser);
      } catch (err) {
        console.error('Error sending verification email:', err);
        // In case of email failure, you might want to rollback user or inform admin
      }
      return true; // Registration successful (email sent)
    },

    // Email Verification
    verifyEmail: async (_parent: any, args: { token: string }, _context: Context) => {
      const { token } = args;
      // Find user with matching verification token and not expired
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpires: { $gt: new Date() },
      });
      if (!user) {
        throw new Error('Invalid or expired verification token.');
      }
      // Update user as verified
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
      await user.save();
      return true;
    },

    // Login (with optional 2FA code)
    login: async (
      _parent: any,
      args: { email: string; password: string; otp?: string },
      _context: Context
    ) => {
      const { email, password, otp } = args;
      // Find user by email and include password and 2FA secret in query (since they are select:false by default)
      const user = await User.findOne({ email }).select('+password +twoFactorSecret');
      if (!user) {
        throw new Error('Incorrect email or password.');
      }
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Incorrect email or password.');
      }
      // Check email verified
      if (!user.emailVerified) {
        throw new Error('Email not verified. Please verify your email before logging in.');
      }
      // If 2FA is enabled for this user, verify the OTP code
      if (user.twoFactorEnabled) {
        if (!otp) {
          throw new Error('Two-factor authentication code is required.');
        }
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret || '', // secret in base32
          encoding: 'base32',
          token: otp,
          window: 1, // allow 1 step before/after for slight clock drift (optional)
        });
        if (!verified) {
          throw new Error('Invalid two-factor authentication code.');
        }
      }
      // All checks passed, generate JWT tokens
      const userId = user._id.toString();
      const accessToken = jwt.sign(
        { sub: userId }, // payload (subject = user ID)
        process.env.JWT_ACCESS_SECRET!, // signing secret for access token
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
      );
      const refreshToken = jwt.sign(
        { sub: userId }, // could include a token version or unique identifier
        process.env.JWT_REFRESH_SECRET!, // signing secret for refresh token
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
      );
      // (Optional) You might store the refresh token or a token identifier in DB for revocation, if needed.

      // Return tokens and user info (excluding sensitive fields)
      return {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    },

    // Refresh Token
    refreshToken: async (_parent: any, args: { token: string }, _context: Context) => {
      const { token } = args;
      try {
        // Verify the refresh token
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
        const userId = payload.sub as string;
        // Find the user associated with the token
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User no longer exists.');
        }
        if (!user.emailVerified) {
          throw new Error('Email not verified.'); // additional guard, though user likely verified if they have tokens
        }
        // (Optional) If using a token version or blacklist, check token validity here (not implemented for brevity).

        // Generate new tokens
        const newAccessToken = jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET!, {
          expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
        });
        const newRefreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, {
          expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
        });
        // (Optional) Invalidate the old refresh token if maintaining a whitelist/blacklist.

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        };
      } catch (err) {
        throw new Error('Invalid or expired refresh token.');
      }
    },

    // Generate 2FA Secret
    generateTwoFactorSecret: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated.');
      }
      // Generate a new TOTP secret for the user
      const secret = speakeasy.generateSecret({
        name: `EcommerceWebshop (${context.user.email})`, // this name will show in Auth app
      });
      // Save the secret (base32) to the user record, but do not enable 2FA yet
      context.user.twoFactorSecret = secret.base32;
      context.user.twoFactorEnabled = false;
      await context.user.save();
      // Return the secret details to the client
      return {
        base32: secret.base32,
        otpauthUrl: secret.otpauth_url,
      };
    },

    // Verify 2FA and enable it
    verifyTwoFactor: async (_parent: any, args: { code: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated.');
      }
      const { code } = args;
      // Ensure a secret exists (generateTwoFactorSecret was called)
      if (!context.user.twoFactorSecret) {
        throw new Error('2FA has not been initiated for this user.');
      }
      // Verify the provided TOTP code
      const verified = speakeasy.totp.verify({
        secret: context.user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1,
      });
      if (!verified) {
        throw new Error('Invalid authentication code. Please try again.');
      }
      // Mark 2FA as enabled
      context.user.twoFactorEnabled = true;
      await context.user.save();
      return true;
    },
  },
};
