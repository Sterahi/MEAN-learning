/* Various Dependencies */
var express = require('express')
var mongoose = require('mongoose')
var passport = require('passport')
var jwt = require('express-jwt')

var router = express.Router()

/* Database Models */
var Post = mongoose.model('Post')
var Comment = mongoose.model('Comment')
var User = mongoose.model('User')

/*                  *Has to match secret in Users.js                             */
/*                  *                      * Used to access Users.js properties. */
/*                  *                      *                                     */
var auth = jwt({ secret: 'SECRET', userProperty: 'payload' })

/* GET home page. */
// Default Route. (keeping for references sake)
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

// Calls the findById method on any post that has the /:post directive.
router.param('post', function (req, res, next, id) {
  var query = Post.findById(id)
  query.exec(function (err, post) {
    if (err) { return next(err) }
    if (!post) { return next(new Error('cant\'t find post')) }
    req.post = post
    return next()
  })
})

// Calls the findById method on any comment that has the /:comment directive.
router.param('comment', function (req, res, next, id) {
  var query = Comment.findById(id)
  query.exec(function (err, comment) {
    if (err) { return next(err) }
    if (!comment) { return next(new Error('cant\'t find comment')) }
    req.comment = comment
    return next()
  })
})

// Route for loading posts array (in JSON)
router.get('/posts', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err) { return next(err) }
    res.json(posts)
  })
})

// Route for adding Posts to DB!
router.post('/posts', auth, function (req, res, next) {
  var post = new Post(req.body)
  post.author = req.payload.username
  // Error checking on posts.
  post.save(function (err, post) {
    if (err) { return next(err) }
    // Returning the post as a JSON
    res.json(post)
  })
})

// Route to retrieve specific posts
router.get('/posts/:post', function (req, res, next) {
  req.post.populate('comments', function (err, post) {
    if (err) { return next(err) }
    res.json(req.post)
  })
})

// Calls the Upvote Method from /models/Posts.js
router.put('/posts/:post/upvote', auth, function (req, res, next) {
  req.post.upvote(function (err, post) {
    if (err) { return next(err) }
    res.json(post)
  })
})
// Displays all comments associated with a specified post
router.post('/posts/:post/comments', auth, function (req, res, next) {
  var comment = new Comment(req.body)
  comment.post = req.post
  comment.author = req.payload.username
  comment.save(function (err, comment) {
    if (err) { return next(err) }
    req.post.comments.push(comment)
    req.post.save(function (err, post) {
      if (err) { return next(err) }
      res.json(comment)
    })
  })
})

// Allows posts to be upvoted.
router.put('/posts/:post/comments/:comment/upvote', auth, function (req, res, next) {
  req.comment.upvote(function (err, comment) {
    if (err) { return next(err) }
    res.json(comment)
  })
})

router.post('/register', function (req, res, next) {
  if (!req.body.username) {
    return res.status(400).json({ message: 'USERNAME: ' + req.body.password })
  } else if (!req.body.password) {
    return res.status(400).json({ message: 'PASSWORD: ' + req.body.password })
  }
  var user = new User()

  user.username = req.body.username
  user.setPassword(req.body.password)

  user.save(function (err) {
    if (err) { return next(err) }

    return res.json({ token: user.generateJWT() })
  })
})

router.post('/login', function (req, res, next) {
  if (!req.body.username) {
    return res.status(400).json({ message: 'Please fill out Username field' })
  } else if (!req.body.password) {
    return res.status(400).json({ message: 'Please fill out Password field' })
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err) }

    if (user) {
      return res.json({ token: user.generateJWT() })
    } else {
      return res.status(401).json(info)
    }
  })(req, res, next)
})

module.exports = router
