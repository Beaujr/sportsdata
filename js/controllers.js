'use strict';

/* Controllers */var teamSelectorApp = angular.module('teamSelectorApp', []);

teamSelectorApp.controller('TeamListCtrl',['$scope', '$http', function ($scope, $http) {
    //var favoriteCookie = $cookies.settings;
    $scope.myTeam = {name: 'Blank'};
    $scope.my = {name: 'Beau Rudder'};
    $scope.home = {};

    $http.get('PHP/API.php?service=centre&id=29').success(function(data) {
        $scope.home = {name: data['name']};
        $scope.leagues = data['leagues'];

    });
    $scope.teamSelect = function() {
        $scope.myTeam = { name : $scope.stats};
        init($scope.teams.id, $scope.stats);
    };

}]);