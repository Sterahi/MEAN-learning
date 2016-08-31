var app = angular.module('flapperNews',[]);

app.controller('MainCtrl', [
  '$scope',
    function($scope){ // $ Scope is declared above as a variable.
      $scope.test = "Hello world!"
      $scope.posts = [
        {title: 'post 1', upvotes: 5},
        {title: 'post 2', upvotes: 3},
        {title: 'post 3', upvotes: 89},
        {title: 'post 4', upvotes: 1}
      ];
      $scope.addPost = function(){
        if(!$scope.title || $scope.title === '') {return}
        $scope.posts.push({title: $scope.title,
                          link: $scope.link,
                          upvotes: 0});
        $scope.title = "";
        $scope.link = "";
      }
      $scope.incrementUpvotes = function(post){
        post.upvotes += 1;
      }
    }
])
