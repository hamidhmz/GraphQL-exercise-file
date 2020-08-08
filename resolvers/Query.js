module.exports = {
  greeting(parent, args) {
    if ((args.name, args.position)) {
      return ` Hello, ${args.name}! You are my favorite ${args.position}`;
    }

    return 'Hello';
  },

  users(parent, args, { User }) {
    if (!args.query) {
      return User.model.find().populate('posts').populate('comments');
    }

    return User.find({
      name: { $regex: args.query.toLowerCase(), $options: 'i' },
    })
      .populate('posts')
      .populate('comments');
  },

  add(parent, args) {
    return args.firstNumber + args.secondNumber;
  },
  posts: (parent, args, { Post }) => Post.model.find().populate('comments').populate('author'),
  comments: (parent, args, { Comment }) => Comment.model.find().populate('post').populate('author'),

  name() {
    if (Math.random() >= 0.5) {
      return 'hamidreza';
    }
    return null;
  },
};
