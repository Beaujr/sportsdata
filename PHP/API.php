<?php
/**
 * Created by PhpStorm.
 * User: beaurudder
 * Date: 2014-07-24
 * Time: 8:17 PM
 */

    include("config.php");
    include("ganon.php");
    include("SportDataAPI.php");
    include("LeagueAthleticsAPI.php");
    if ($_GET['source'] == 'SportData'){
        $Source = new SportDataApi();
    } else {
        $Source = new LeagueAthleticsAPI();
    }

    $mongoClient = new MongoClient("mongodb://".$dbUsername.":".$dbPassword."@ds053429.mongolab.com:53429/sportdata");
    $db = 'sportdata';
    $id = $_GET['id'];
    $service = $_GET["service"];
    $resultArray = false;
    if ($service == 'centre' && $id != null) {
        $resultArray = findData($service, 'id', $id);
        if ($resultArray == null) {
            $Source->loadCentreData($id);
            $resultArray = $Source->loadLeagues();
            $resultArray['id'] = $id;
            insertData($service, $resultArray);
        }

    } else if ($service == 'league' && $id != null) {
        $resultArray = findData($service, 'id', $id);
        if ($resultArray == null) {
            $Source->loadLeagueData($id);
            $resultArray = ($Source->loadDivisions());
            insertData($service, $resultArray);
        }
    } else if ($service == 'division' && $id != null) {
        $resultArray = findData($service, 'id', $id);
        if ($resultArray == null) {
            $Source->loadDivisionData($id);
            $resultArray = ($Source->loadTeams());
            insertData($service, $resultArray);
        }
    } else if ($service == 'score' && $id != null) {
        $resultArray = findData($service, 'id', $id);
        if ($resultArray == null) {
            $Source->loadDivisionData($id);
            $resultArray = array('id'=>$id, 'Score' => $Source->pastScores_By_Game(), 'Teams' => $Source->loadTeams());
            insertData($service, $resultArray);
        }
    } else if ($service == 'site') {
        $resultArray = findData($service, 'name', $id);
        if ($resultArray == null) {
            $Source->loadSiteData();
            $resultArray = ($Source->loadSite());
            insertData($service, $resultArray);
        }
    }

    function findData($collectionName, $fieldname, $key){
        global $mongoClient;
        global $db;

        $collection = $mongoClient->selectCollection($db, $collectionName);
        $resultArray = $collection->findOne(array($fieldname => (string) $key));
        return $resultArray;
    }

    function insertData($collectionName, $value){
        global $mongoClient;
        global $db;
        $collection = $mongoClient->selectCollection($db, $collectionName);
        $value['createdAt'] = new Date();
        $collection->insert($value);
    }
    echo json_encode($resultArray);
?>