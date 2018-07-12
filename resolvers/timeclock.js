import loaders from '../loaders';

export default {
  Mutation: {
    startTimeClock: async (_, args, { models }) => {
      try {
        const timeclock = await models.TimeClock.create(args);
        return { ok: true, timeclock };
      } catch (err) {
        return {
          ok: false
        };
      }
    },
    stopTimeClock: async (_, __, { models, user }) => {
      try {
        console.log(user);
        const updatedTimeClock = await models.TimeClock.findOneAndUpdate(
          {
            active_timeclock: true,
            user_id: user.id
          },
          {
            active_timeclock: false,
            punched_out: new Date()
          }
        );
        console.log(updatedTimeClock);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  },
  Query: {
    allTimeClocks: (_, __, { models }) => models.TimeClock.find({}),
    getUserTimeClocks: (_, { id }, { models }) =>
      models.TimeClock.find({ user_id: id }),
    getActiveUserTimeClock: async (_, __, { models, user }) => {
      const { id } = user;
      const timeclock = await models.TimeClock.findOne({
        user_id: id,
        active_timeclock: true
      });
      if (timeclock) {
        return {
          hasActiveTimeClock: true,
          timeclock
        };
      }
      return {
        hasActiveTimeClock: false
      };
    }
  },
  TimeClock: {
    user({ user_id: userId }) {
      return loaders.userLoader.load(userId);
    }
  }
};
