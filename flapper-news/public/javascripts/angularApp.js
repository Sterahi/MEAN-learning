var angular = angular
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
      .state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthCtrl',
        onEnter: [ '$state', 'auth', function ($state, auth) {
          if (auth.isLoggedIn()) {
            $state.go('home')
          }
        }]
      })
      .state('login', {
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthCtrl',
        onEnter: [ '$state', 'auth', function ($state, auth) {
          if (auth.isLoggedIn()) {
            $state.go('home')
          }
        }]
      })
    $urlRouterProvider.otherwise('home')
  }])

/* Factory for Authorization */
app.factory('auth', ['$http', '$window', function ($http, $window) {
  var auth = {}

  auth.saveToken = function (token) {
    $window.localStorage['flapper-news-token'] = token
  }

  auth.getToken = function (token) {
    return $window.localStorage ['flapper-news-token']
  }

  auth.isLoggedIn = function () {
    var token = auth.getToken()

    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]))

      return payload.exp > Date.now() / 1000
    } else {
      return false
    }
  }

  auth.CurrentUser = function () {
    if (auth.isLoggedIn()) {
      var token = auth.getToken()
      var payload = JSON.parse($window.atob(token.split('.')))

      return payload.username
    }
  }

  auth.register = function (user) {
    return $http.post('/register', user).success(function (data) {
      auth.saveToken(data.token)
    })
  }

  auth.logIn = function (user) {
    return $http.post('/login', user).success(function (data) {
      auth.saveToken(data.token)
    })
  }

  auth.logOut = function () {
    $window.localStorage.removeItem('flapper-news-token')
  }

  return auth
}])

/* Factory for Posts and all the required methods  */
app.factory('posts', ['$http', 'auth', function ($http) {
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

  /* Get single post */
  o.get = function (id) {
    return $http.get('/posts/' + id).then(function (res) {
      return res.data
    })
  }

  /* Create new link Post */
  o.create = function (post) {
    return $http.post('/posts', post, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    })
  }

  /* Add comment to front page (starts with 0 upvotes) */
  o.addComment = function (id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    })
  }

  /* Upvoting  post*/
  o.upvote = function (post) {
    return $http.put('/posts/' + post._id + '/upvote', null, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    })
    .success(function (data) {
      post.upvotes += 1
    })
  }

  /* Upvote Comment. Currently broken and troubleshooting.
     All variables are being passed to function properly, still not upvoting.*/
  o.upvoteComment =
  function (post, comment) {
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    })
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
  'auth',
  function ($scope, posts, auth) {
    /* Binding Scope.posts to posts.posts*/
    $scope.posts = posts.posts
    $scope.isLoggedIn = auth.isLoggedIn

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
  'auth',
  function ($scope, posts, post, auth) {
    /* Binding $scope.post to o.post */
    $scope.post = post
    $scope.isLoggedIn = auth.isLoggedIn

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
/* ------------------------------------------------------------------------*/
app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function ($scope, $state, auth) {
    $scope.user = {}

    $scope.register = function () {
      auth.register($scope.user).error(function (error) {
        $scope.error = error
      }).then(function () {
        $state.go('home')
      })

      $scope.logIn = function () {
        auth.logIn($scope.user).error(function (error) {
          $scope.error = error
        }).then(function () {
          $state.go('home')
        })
      }
    }
  }
])

app.controller('NavCtrl', [
  '$scope',
  'auth',
  function ($scope, auth) {
    $scope.isLoggedIn = auth.isLoggedIn
    $scope.CurrentUser = auth.currentUser
    $scope.logOut = auth.logout
  }])
