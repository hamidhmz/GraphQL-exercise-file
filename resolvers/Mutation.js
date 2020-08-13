const { removeUndefinedFieldFromObject } = require('../utils');

module.exports = {
  /* -------------------------------------------------------------------------- */
  /*                               create examples                              */
  /* -------------------------------------------------------------------------- */
  async createUser(parent, args, { User }) {
    const result = await User.model.create({
      name: args.data.name,
      email: args.data.email,
      age: args.data.age,
    });
    return result;
  },
  async createPost(parent, args, { Post, User, pubsub }) {
    const result = await Post.model.create({
      title: args.data.title,
      body: args.data.body,
      published: args.data.published,
      author: args.data.author,
    });

    await User.model.updateOne(
      { _id: args.data.author },
      {
        $push: {
          posts: result.id,
        },
      },
    );

    const post = await Post.model
      .findOne({ _id: result.id })
      .populate({
        path: 'author',
        populate: {
          path: 'posts',
          model: 'Post',
        },
      })
      .populate({
        path: 'author',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      });

    pubsub.publish('all_posts', {
      post: {
        mutation: 'CREATE',
        data: post,
      },
    });

    return post;
  },
  async createComment(parent, args, {
    Comment, User, Post, pubsub,
  }) {
    const result = await Comment.model.create({
      text: args.data.text,
      author: args.data.author,
      post: args.data.post,
    });

    await User.model.updateOne(
      { _id: args.data.author },
      {
        $push: {
          comments: result.id,
        },
      },
    );

    await Post.model.updateOne(
      { _id: args.data.post },
      {
        $push: {
          comments: result.id,
        },
      },
    );

    const comment = await Comment.model
      .findOne({ _id: result.id })
      .populate({
        path: 'author',
        populate: {
          path: 'posts',
          model: 'Post',
        },
      })
      .populate({
        path: 'author',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .populate({
        path: 'post',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          model: 'User',
        },
      });

    pubsub.publish(`COMMENT${args.data.post}`, {
      comment: {
        mutation: 'CREATE',
        data: comment,
      },
    });

    return comment;
  },

  /* -------------------------------------------------------------------------- */
  /*                             example for delete                             */
  /* -------------------------------------------------------------------------- */
  async deleteUser(parent, args, { User, Post, Comment }) {
    const user = await User.model.findOne({
      _id: args.id,
    });

    if (!user) {
      throw Error('user does not exits');
    }

    await Post.model.deleteMany({
      _id: { $in: user.posts },
    });
    await Comment.model.deleteMany({
      _id: { $in: user.comments },
    });
    await User.model.deleteOne({
      _id: args.id,
    });

    return user;
  },
  async deletePost(parent, args, { Post, Comment, pubsub }) {
    const post = await Post.model.findOne({
      _id: args.id,
    });

    if (!post) {
      throw Error('user does not exits');
    }

    await Comment.model.deleteMany({
      _id: { $in: post.comments },
    });

    await Post.model.deleteOne({
      _id: args.id,
    });

    pubsub.publish('all_posts', {
      post: {
        mutation: 'DELETE',
        data: post,
      },
    });

    return post;
  },
  async deleteComment(parent, args, { Comment, pubsub }) {
    const comment = await Comment.model
      .findOne({
        _id: args.id,
      })
      .populate({
        path: 'author',
        populate: {
          path: 'posts',
          model: 'Post',
        },
      })
      .populate({
        path: 'author',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .populate({
        path: 'post',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          model: 'User',
        },
      });

    if (!comment) {
      throw Error('comment does not exits');
    }

    await Comment.model.deleteOne({
      _id: args.id,
    });

    pubsub.publish(`COMMENT${comment.post.id}`, {
      comment: {
        mutation: 'DELETE',
        data: comment,
      },
    });

    return comment;
  },

  /* -------------------------------------------------------------------------- */
  /*                             example for update                             */
  /* -------------------------------------------------------------------------- */
  async updateUser(parent, { id, data }, { User }) {
    const mutation = {
      name: data.name,
      email: data.email,
      age: data.age,
    };

    removeUndefinedFieldFromObject(mutation);

    const result = await User.model.findOneAndUpdate(
      { _id: id },
      {
        $set: mutation,
      },
      { new: true },
    );

    if (!result) {
      throw Error('user does not exits');
    }
    return result;
  },
  async updateComment(parent, { id, data }, { Comment, pubsub }) {
    const mutation = {
      text: data.text,
    };

    removeUndefinedFieldFromObject(mutation);
    const result = await Comment.model
      .findOneAndUpdate(
        { _id: id },
        {
          $set: mutation,
        },
        { new: true },
      )
      .populate({
        path: 'author',
        populate: {
          path: 'posts',
          model: 'Post',
        },
      })
      .populate({
        path: 'author',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .populate({
        path: 'post',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          model: 'User',
        },
      });
    if (!result) {
      throw Error('Comment does not exits');
    }

    pubsub.publish(`COMMENT${result.post.id}`, {
      comment: {
        mutation: 'UPDATE',
        data: result,
      },
    });

    return result;
  },
  async updatePost(parent, { id, data }, { Post, pubsub }) {
    const mutation = {
      title: data.title,
      body: data.body,
      published: data.published,
    };

    removeUndefinedFieldFromObject(mutation);

    const result = await Post.model.findOneAndUpdate(
      { _id: id },
      {
        $set: mutation,
      },
      { new: true },
    );
    if (!result) {
      throw Error('Post does not exits');
    }

    pubsub.publish('all_posts', {
      post: {
        mutation: 'UPDATE',
        data: result,
      },
    });

    return result;
  },
};
