module.exports = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0;

      setInterval(() => {
        count += 1;

        pubsub.publish('count1', {
          // count1 can be any name
          count,
        });
      }, 1000);

      return pubsub.asyncIterator('count1'); // count1 can be any name
    },
  },
  comment: {
    async subscribe(parent, { postId }, { pubsub, Post }, info) {
      const post = await Post.model.findOne({
        _id: postId,
      });

      if (!post) {
        throw Error('post does not exits');
      }

      return pubsub.asyncIterator(`COMMENT${postId}`);
    },
  },
  post: {
    async subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('all_posts');
    },
  },
};
