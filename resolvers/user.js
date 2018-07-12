import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import formatErrors from '../formatErrors';
import { tryLogin } from '../auth';

export default {
  Query: {
    getUser: async (parent, { username }, { models }) =>
      models.User.findOne({ username }),
    allUsers: (parent, args, { models }) => models.User.find({})
  },
  Mutation: {
    login: (_, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2),
    addUser: async (_, args, { models }) => {
      const hashedPassword = await bcrypt.hash(args.password, 12);
      try {
        const user = await models.User.create({
          ...args,
          password: hashedPassword
        });
        return {
          ok: true,
          user
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models)
        };
      }
    },
    updatePassword: async (
      _,
      { password, token, _id },
      { models, SECRET2 }
    ) => {
      const user = await models.User.findById(_id);
      try {
        jwt.verify(token, SECRET2 + user.password);
        const hashedPassword = await bcrypt.hash(password, 12);
        await models.User.findByIdAndUpdate(_id, { password: hashedPassword });
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }
};
