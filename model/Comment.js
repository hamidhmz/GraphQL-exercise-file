const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
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

const comment = mongoose.model('Comment', commentSchema);

module.exports = {
  validator: validatorSchema,
  model: comment,
};
