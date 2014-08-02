<?php
/**
 * Created by PhpStorm.
 * User: beaurudder
 * Date: 2014-07-24
 * Time: 8:17 PM
 */
    include("config.php");
    include("SportDataAPI.php");
    $SportsData = new SportDataApi();
    $mongoClient = new MongoClient("mongodb://".$dbUsername.":".$dbPassword."@ds053429.mongolab.com:53429/sportdata");
    $db = 'sportdata';
    $id = $_GET['id'];
    $service = $_GET["service"];
    $resultArray = false;
    if ($service == 'centre' && $id != null) {
        $resultArray = findData($service);
        if ($resultArray == null) {
            $SportsData->loadCentreData($id);
            $resultArray = $SportsData->loadLeagues();
            insertData($service, $resultArray);
        }

    } else if ($service == 'league' && $id != null) {
        $resultArray = findData($service);
        if ($resultArray == null) {
            $SportsData->loadLeagueData($id);
            $resultArray = ($SportsData->loadDivisions());
            insertData($service, $resultArray);
        }
    } else if ($service == 'division' && $id != null) {
        $resultArray = findData($service);
        if ($resultArray == null) {
            $SportsData->loadDivisionData($id);
            $resultArray = ($SportsData->loadTeams());
            insertData($service, $resultArray);
        }
    } else if ($service == 'score' && $id != null) {
        $resultArray = $resultArray = findData($service);
        if ($resultArray == null) {
            $SportsData->loadDivisionData($id);
            $resultArray = array('Score' => $SportsData->pastScores_By_Game(), 'Teams' => $SportsData->loadTeams());
            insertData($service, $resultArray);
        }
    } else if ($service == 'site') {
        $resultArray = findData($service);
        if ($resultArray == null) {
            $SportsData->loadSiteData();
            $resultArray = ($SportsData->loadSite());
            insertData($service, $resultArray);
        }
    }

    function findData($collectionName){
        global $mongoClient;
        global $db;
        $collection = $mongoClient->selectCollection($db, $collectionName);
        $resultArray = $collection->findOne(array('id' => (string)$_GET['id']));
        return $resultArray;
    }

    function insertData($collectionName, $value){
        global $mongoClient;
        global $db;
        $collection = $mongoClient->selectCollection($db, $collectionName);
        $value['id'] = $_GET['id'];
        $collection->insert($value);
    }
    echo json_encode($resultArray);
?>