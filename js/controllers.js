'use strict';

/* Controllers */var teamSelectorApp = angular.module('teamSelectorApp', []);

teamSelectorApp.controller('TeamListCtrl',['$scope', '$http', function ($scope, $http) {
    //var favoriteCookie = $cookies.settings;
    $scope.myTeam = {name: 'Blank'};
    $scope.my = {name: 'Beau Rudder'};
    $scope.home = {};
    $http.get('PHP/API.php?service=site').success(function(data) {
        $scope.sites = data['leagues'];

    });
    $scope.centre = function(){
        $scope.leagues = undefined;
        $scope.divisions = undefined;
        $scope.teams = undefined;
        $http.get('PHP/API.php?service=centre&id='+$scope.site.id).success(function(data) {
            $scope.home = {name: data['name']};
            $scope.leagues = data['leagues'];

        });
    };

    $scope.teamSelect = function() {
        $scope.myTeam = { name : $scope.stats};
        codeAddress($scope.home);
        setTeam($scope.stats);
        createCookie('settings',$scope.home.name+":"+$scope.stats+':'+ $scope.teams.id, 7);
    };
    $scope.division = function () {
        $scope.myTeam = { name : $scope.stats};
        init($scope.teams.id);
    }

}]);