var mongoose = require('mongoose');

var CommentScehma = new mongoose.Schema({
  body: String,
  author: String,
  upvotes: { type: Number, default: 0}m
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

mongoose.model('Comment', CommentSchema);
