'use strict';

/* Controllers */
var teamSelectorApp = angular.module('teamSelectorApp', ['ngCookies', 'ui.bootstrap']);

teamSelectorApp.controller('TeamListCtrl',['$scope', '$http', '$cookieStore', function ($scope, $http, $cookieStore) {
    //var favoriteCookie = $cookies.settings;
    $scope.myTeam = { name: $cookieStore.get("myTeam") };
    $scope.my = {name: 'Beau Rudder'};
    $scope.home = {name: $cookieStore.get("location")};
    $scope.radioModel = 'SportData';

    $scope.$watch('radioModel', function(newValue, oldValue) {

        $http.get('PHP/API.php?service=site&id='+newValue+'&source='+newValue).success(function(data) {
            if (data['leagues'].length ==1 ) {
                $scope.site = data['leagues'][0];
                $scope.centre();
            }
            $scope.sites = data['leagues'];
            $scope.leagues = undefined;
            $scope.divisions = undefined;
            $scope.teams = undefined;

        });
    });


    if ($scope.myTeam && $scope.home && $cookieStore.get("division")){
        init($cookieStore.get("division"), $cookieStore.get("source"));
        myTeam = $scope.myTeam.name;
        codeAddress($scope.home);
    }
    $scope.centre = function(){
        $scope.leagues = undefined;
        $scope.divisions = undefined;
        $scope.teams = undefined;
        $http.get('PHP/API.php?service=centre&id='+$scope.site.id+'&source='+$scope.radioModel).success(function(data) {
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
        $cookieStore.put("source", $scope.radioModel);
        setTeam($scope.stats);
        //createCookie('settings',$scope.home.name+":"+$scope.stats+':'+ $scope.division.id, 7);
    };
    $scope.division = function () {
        //$scope.myTeam = { name : $scope.stats};
        init($scope.teams.id);
//        id = $scope.teams.id;
//        $scope.scores = null;
//        $scope.playerTeams = null;
//        $http.get("PHP/API.php?service=score&id=" + id, function (data) {
//            $scope.scores = data['Score'];
//
//            $scope.playerTeams = data['Teams'];
//        });


    }

}]);