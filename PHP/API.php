<?php
/**
 * Created by PhpStorm.
 * User: beaurudder
 * Date: 2014-07-24
 * Time: 8:17 PM
 */
include("SportDataAPI.php");
$SportsData = new SportDataApi();

if ($_GET["service"] == 'centre' && $_GET['id'] != null) {
    $SportsData->loadCentreData($_GET['id']);
    echo json_encode($SportsData->loadLeagues());
} else if ($_GET['service'] == 'league' && $_GET['id'] != null) {
    $SportsData->loadLeagueData($_GET['id']);
    echo json_encode($SportsData->loadDivisions());
} else if ($_GET['service'] == 'division' && $_GET['id'] != null) {
    $SportsData->loadDivisionData($_GET['id']);
    echo json_encode($SportsData->loadTeams());
} else if ($_GET['service'] == 'score' && $_GET['id'] != null) {
    $SportsData->loadDivisionData($_GET['id']);
    $scoreArray = array('Score' => $SportsData->pastScores_By_Game(), 'Teams' => $SportsData->loadTeams());
    echo json_encode($scoreArray);
} else if ($_GET['service'] == 'site') {
    $SportsData->loadSiteData();

    echo json_encode($SportsData->loadSite());
}
?>