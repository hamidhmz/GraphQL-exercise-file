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
};
