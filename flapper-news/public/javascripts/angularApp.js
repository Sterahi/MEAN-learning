angular.module('flapperNews', ['ui.router'])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){
      $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'MainCtrl',
          resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
          }
        });
      $urlRouterProvider.otherwise('home');
    }])

  .factory('posts', ['$http', function($http){
    var o = {
      posts: []
    }

    o.getAll = function() {
      return $http.get('/posts').success(function(data){
        angular.copy(data, o.posts)
      })
    }

    o.create = function(post) {
      return $http.post('/posts', post).success( function (data){
        o.posts.push(data)
      })
    }

    o.upvote = function(post) {
      return $http.put('/posts/' + post._id + '/upvote')
        .success(function(data){
          post.upvotes += 1
        })
    }

    return o
  }])


  .controller('MainCtrl', [
  '$scope',
  '$stateParams',
  'posts',
  function($scope, $stateParams, posts){
    $scope.posts = posts.posts;

    $scope.addPost = function(){
      if(!$scope.title || $scope.title === ''){ return }
      posts.create({
        title: $scope.title,
        link: $scope.link
      })
      $scope.title = ''
      $scope.link = ''
    }
    $scope.incrementUpvotes = function(post){
      posts.upvote(post)
    }
  }]);
