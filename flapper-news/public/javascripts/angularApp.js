var app = angular.module('flapperNews', ['ui.router'])

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['posts', function (posts) {
            return posts.getAll()
          }]
        }
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function ($stateParams, posts) {
            return posts.get($stateParams.id)
          }]
        }
      })
    $urlRouterProvider.otherwise('home')
  }])

app.factory('posts', ['$http', function ($http) {
  /* Initial Declaration of Posts Array */
  var o = {
    posts: []
  }

  /* Get All posts for the homepage */
  o.getAll = function () {
    return $http.get('/posts').success(function (data) {
      angular.copy(data, o.posts)
    })
  }

  /* Create new link Post */
  o.create = function (post) {
    return $http.post('/posts', post).success(function (data) {
      o.posts.push(data)
    })
  }

  /* Get single post */
  o.get = function (id) {
    return $http.get('/posts/' + id).then(function (res) {
      return res.data
    })
  }

  /* Add comment to front page (starts with 0 upvotes) */
  o.addComment = function (id, comment) {
    return $http.post('/posts/' + id + '/comments', comment)
  }

  /* Upvoting  post*/
  o.upvote = function (post) {
    return $http.put('/posts/' + post._id + '/upvote')
    .success(function (data) {
      post.upvotes += 1
    })
  }

  /* Upvote Comment. Currently broken and troubleshooting.
     All variables are being passed to function properly, still not upvoting.*/
  o.upvoteComment =
  function (post, comment) {
    console.log('Reached UpvoteComment')
    console.log(post._id)
    console.log(comment._id)
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
      .success(function (data) {
        comment.upvotes += 1
      })
  }

  /* Returning o to return all of Posts methods.*/
  return o
}])

/* Controller for homepage. */
app.controller('MainCtrl', [
  '$scope',
  'posts',
  function ($scope, posts) {
    /* Binding Scope.posts to posts.posts*/
    $scope.posts = posts.posts

    /* Function to add post to using posts(o).create */
    $scope.addPost = function () {
      if (!$scope.title || $scope.title === '') { return }
      posts.create({
        title: $scope.title,
        link: $scope.link
      })
      $scope.title = ''
      $scope.link = ''
    }
    /* Calling posts(o).upvote to write to Db */
    $scope.incrementUpvotes = function (post) {
      posts.upvote(post)
    }
  }])
/* ------------------------------------------------------------------------*/
app.controller('PostsCtrl', [
  '$scope',
  'posts',
  'post',
  function ($scope, posts, post) {
    /* Binding $scope.post to o.post */
    $scope.post = post

    $scope.incrementUpvotes = function (comment) {
      posts.upvoteComment(post, comment)
    }

    $scope.addComment = function () {
      if ($scope.body === '') { return }
      posts.addComment(post._id, {
        body: $scope.body,
        author: 'user'
      }).success(function (comment) {
        $scope.post.comments.push(comment)
      })
      $scope.body = ''
    }
  }
])
