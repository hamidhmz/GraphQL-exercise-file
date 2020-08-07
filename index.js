const { ApolloServer, gql } = require('apollo-server');

const users = [
  {
    id: 1,
    name: 'hamid',
    email: 'hamid@hamid.com',
    age: 27,
  },
  {
    id: 2,
    name: 'Ema',
    email: 'ema@ema.com',
  },
  {
    id: 3,
    name: 'babak',
    email: 'babak@babak.com',
  },
];

// The GraphQL schema
const typeDefs = gql`
  type Query {
    
    "example for parameters"
    greeting(name: String, position: String): String! 
    "example for parameters"
    add(firstNumber: Int!, secondNumber: Int!): Int!
    "example for arrays"
    users(query: String): [User!]!
    "example for arrays"
    addArray(numbers: [Float!]!): Float!
    "example for arrays"
    grades: [Int!]!
    "example for custom types "
    post: Post!
    "example for types "
    name: String
    "example for types "
    familyName: String!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    greeting(parent, args, ctx, info) {
      if ((args.name, args.position)) {
        return ` Hello, ${args.name}! You are my favorite ${args.position}`;
      }

      return 'Hello';
    },

    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }
      return users.filter((user) => user.name.toLowerCase().includes(args.query.toLowerCase()));
    },

    add(parent, args, ctx, info) {
      return args.firstNumber + args.secondNumber;
    },
    post: () => ({
      id: 10,
      title: 'some title',
      body: 'some body',
      published: true,
    }),

    name() {
      if (Math.random() >= 0.5) {
        return 'hamidreza';
      }
      return null;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
