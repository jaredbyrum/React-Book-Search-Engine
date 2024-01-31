const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      return User.findOne({
        _id: context.user._id
      });
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, args) => {
      const user = await User.findOne({ $or: [{ username: args.username }, { email: args.email }]});

      if (!user) {
        throw new AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        throw new AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, args, context) => {
      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: args }},
        { new: true }
      );
    },

    removeBook: async (parent, args, context) => {
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId }}},
        { new: true }
      );
    },  
  },
};

module.exports = resolvers;