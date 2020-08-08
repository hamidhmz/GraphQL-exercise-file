const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const config = require('config');
const mongoose = require('mongoose');

const typeDefs = importSchema('./graphql/schema.graphql');

const mongoDB = config.get('db');
mongoose.connect(mongoDB, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const models = require('./model');

// The GraphQL schema
// const typeDefs = gql`
//   type Mutation {
//     "example for mutation create data"
//     createUser(data: createUserInput): User!
//     "example for mutation create data"
//     createPost(data: createPostInput): Post!
//     "example for mutation create data"
//     createComment(data: createCommentInput): Comment!
//     "example for mutation delete data"
//     deleteUser(id: ID!): User!
//     "example for mutation delete data"
//     deletePost(id: ID!): Post!
//     "example for mutation delete data"
//     deleteComment(id: ID!): Comment!
//   }

//   type Query {
//     "example for parameters"
//     greeting(name: String, position: String): String!
//     "example for parameters"
//     add(firstNumber: Int!, secondNumber: Int!): Int!
//     "example for arrays"
//     users(query: String): [User]!
//     "example for arrays"
//     comments: [Comment]!
//     "example for arrays"
//     addArray(numbers: [Float!]!): Float!
//     "example for arrays"
//     grades: [Int!]!
//     "example for custom types "
//     posts: [Post]!
//     "example for types "
//     name: String
//     "example for types "
//     familyName: String!
//   }

//   input createUserInput {
//     name: String!
//     email: String!
//     age: Int
//   }

//   input createPostInput {
//     title: String!
//     body: String!
//     published: Boolean!
//     author: ID!
//   }

//   input createCommentInput {
//     text: String!
//     author: ID!
//     post: ID!
//   }

//   type Post {
//     id: ID!
//     title: String!
//     body: String!
//     published: Boolean!
//     author: User!
//     comments: [Comment]!
//   }

//   type User {
//     id: ID!
//     name: String!
//     email: String!
//     age: Int
//     posts: [Post]!
//     comments: [Comment]!
//   }

//   type Comment {
//     id: ID!
//     text: String!
//     author: User!
//     post: Post!
//   }
// `;

// A map of functions which return data for the schema.
const resolvers = {
  Mutation: {
    /* -------------------------------------------------------------------------- */
    /*                               create examples                              */
    /* -------------------------------------------------------------------------- */
    async createUser(parent, args, { User }, info) {
      const result = await User.model.create({
        name: args.data.name,
        email: args.data.email,
        age: args.data.age,
      });
      return result;
    },
    async createPost(parent, args, { Post, User }, info) {
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

      return post;
    },
    async createComment(parent, args, { Comment, User, Post }, info) {
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

      return comment;
    },

    /* -------------------------------------------------------------------------- */
    /*                             example for delete                             */
    /* -------------------------------------------------------------------------- */
    async deleteUser(parent, args, { User, Post, Comment }, info) {
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
    async deletePost(parent, args, { Post, Comment }, info) {
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

      return post;
    },
    async deleteComment(parent, args, { User }, info) {
      const result = await User.model.create({
        name: args.data.name,
        email: args.data.email,
        age: args.data.age,
      });
      return result;
    },
  },
  Query: {
    greeting(parent, args, ctx, info) {
      if ((args.name, args.position)) {
        return ` Hello, ${args.name}! You are my favorite ${args.position}`;
      }

      return 'Hello';
    },

    users(parent, args, { User }, info) {
      if (!args.query) {
        return User.model.find().populate('posts').populate('comments');
      }

      return User.find({
        name: { $regex: args.query.toLowerCase(), $options: 'i' },
      })
        .populate('posts')
        .populate('comments');
    },

    add(parent, args, ctx, info) {
      return args.firstNumber + args.secondNumber;
    },
    posts: (parent, args, { Post }, info) => Post.model.find().populate('comments').populate('author'),
    comments: (parent, args, { Comment }, info) => Comment.model.find().populate('post').populate('author'),

    name() {
      if (Math.random() >= 0.5) {
        return 'hamidreza';
      }
      return null;
    },
  },
  Post: {
    // author(parent, args, ctx, info) {
    // return users.find((user) => parent.author === user.id);
    // },
    // comments(parent, args, ctx, info) {
    //   return comments.filter((comment) => {
    //     const result = parent.comments.indexOf(comment.id);
    //     return result >= 0;
    //   });
    // },
  },
  Comment: {
    // author(parent, args, ctx, info) {
    //   return users.find((user) => parent.author === user.id);
    // },
    // post(parent, args, ctx, info) {
    //   return posts.find((post) => parent.post === post.id);
    // },
  },
  User: {
    // posts(parent, args, ctx, info) {
    //   return posts.filter((post) => parent.posts.indexOf(post.id) >= 0);
    // },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    User: models.User,
    Comment: models.Comment,
    Post: models.Post,
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
