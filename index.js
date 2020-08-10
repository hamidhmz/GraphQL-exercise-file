const { ApolloServer, PubSub } = require('apollo-server');
const { importSchema } = require('graphql-import');
const config = require('config');
const mongoose = require('mongoose');
const resolvers = require('./resolvers');
const models = require('./model');

const typeDefs = importSchema('./graphql/schema.graphql');

const mongoDB = config.get('db');
mongoose.connect(mongoDB, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { ...models, pubsub },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
