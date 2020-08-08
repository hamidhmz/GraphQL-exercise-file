const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const config = require('config');

const { Schema } = mongoose;

const userSchema = Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
});

// userSchema.methods.generateAuthToken = function () {
//   return jwt.sign({ _id: this._id, email: this.email }, config.get('jwt'), {
//     expiresIn: '10h',
//   });
// };

// Export the model
const User = mongoose.model('User', userSchema);

module.exports = {
  model: User,
};
