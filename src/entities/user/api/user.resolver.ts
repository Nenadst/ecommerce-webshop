import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../model/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userResolvers = {
  Mutation: {
    register: async (
      _: never,
      { input }: { input: { email: string; password: string; name: string } }
    ) => {
      const { email, password, name } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email,
        password: hashedPassword,
        name,
        role: 'user',
      });

      await user.save();

      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    },

    login: async (_: never, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;

      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    },
  },
};

export default userResolvers;
