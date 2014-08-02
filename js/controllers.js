'use strict';

/* Controllers */
var teamSelectorApp = angular.module('teamSelectorApp', ['ngCookies']);

teamSelectorApp.controller('TeamListCtrl',['$scope', '$http', '$cookieStore', function ($scope, $http, $cookieStore) {
    //var favoriteCookie = $cookies.settings;
    $scope.myTeam = { name: $cookieStore.get("myTeam") };
    $scope.my = {name: 'Beau Rudder'};
    $scope.home = {name: $cookieStore.get("location")};
    if ($scope.myTeam && $scope.home && $cookieStore.get("division")){
        init($cookieStore.get("division"));
        myTeam = $scope.myTeam.name;
        codeAddress($scope.home);
    }
    $http.get('PHP/API.php?service=site&id=SportData').success(function(data) {
        $scope.sites = data['leagues'];

    });
    $scope.centre = function(){
        $scope.leagues = undefined;
        $scope.divisions = undefined;
        $scope.teams = undefined;
        $http.get('PHP/API.php?service=centre&id='+$scope.site.id).success(function(data) {
            $scope.home = {name: data['name']};
            codeAddress($scope.home);
            $scope.leagues = data['leagues'];

        });
    };

    $scope.teamSelect = function() {
        $scope.myTeam = { name : $scope.stats};
        $cookieStore.put("myTeam", $scope.stats);
        $cookieStore.put("division", $scope.teams.id);
        $cookieStore.put("location", $scope.home.name);
        setTeam($scope.stats);
        //createCookie('settings',$scope.home.name+":"+$scope.stats+':'+ $scope.division.id, 7);
    };
    $scope.division = function () {
        //$scope.myTeam = { name : $scope.stats};

        init($scope.teams.id);
    }

}]);