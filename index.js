const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const config = require('config');
const mongoose = require('mongoose');
const resolvers = require('./resolvers');

const typeDefs = importSchema('./graphql/schema.graphql');

const mongoDB = config.get('db');
mongoose.connect(mongoDB, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const models = require('./model');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: models,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
