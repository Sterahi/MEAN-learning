var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Post = mongoose.model('Post')
var Comment = mongoose.model('Comment')

/* GET home page. */
//Default Route. (keeping for references sake)
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Calls the findById method on any post that has the /:post directive.
router.param('post', function(req, res, next, id){
  var query = Post.findById(id)
  query.exec (function (err, post){
    if (err) { return next(err) }
    if (!post) { return next( new Error ('cant\'t find post'))}
    req.post = post;
    return next()
  })
})

//Calls the findById method on any post that has the /:comment directive.
router.param('comment', function(req, res, next, id){
  var query = Comment.findById(id)
  query.exec (function (err, post){
    if (err) { return next (err) }
    if (!post) { return next( new Error ('cant\'t find post'))}
    req.comment = comment;
    return next()
  })
})

// Route for loading posts array (in JSON)
router.get('/posts', function(req, res, next){
  Post.find(function(err, posts){
    if(err) { return next(err) }
    res.json(posts)
  })
})

// Route for adding Posts to DB!
router.post('/posts', function(req, res, next){
  var post = new Post(req.body)
  // Error checking on posts.
  post.save(function(err, post){
    if(err){ return next(err) }
    // Returning the post as a JSON
    res.json(post)
  })
})

//Route to retrieve specific posts
router.get('/posts/:post', function(req, res) {
  req.post.populate('comments', function(err, post){
    if (err) { return next(err) }
    res.json(req.post)
  })
})

// Calls the Upvote Method from /models/Posts.js
router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err) }
    res.json(post)
  })
})

router.post('/posts/:post/comments', function (req, res,next) {
  var comment = new Comment(req.body)
  comment.post = req.post
  comment.save (function (err, comment){
    if(err){ return next(err) }
    req.post.comments.push(comment)
    req.post.save(function (err, post) {
      if (err) { return next(err) }
      res.json(comment)
    })
  })
})

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
  req.comment.upvote(function(err, comment){
    if (err) {return next(err)}
  })
})

module.exports = router;
