const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  body: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    required: true,
    default: false,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
});

const validatorSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      maxLength: 255,
      minLength: 3,
    },
    description: {
      type: 'string',
      maxLength: 255,
      minLength: 3,
    },
    text: {
      type: 'string',
      maxLength: 10000,
      minLength: 3,
    },
  },
};

const Post = mongoose.model('Post', postSchema);

module.exports = {
  validator: validatorSchema,
  model: Post,
};
