export default {
  Query: {
    getLocations: (_, __, { models }) => models.Location.find({})
  }
};
