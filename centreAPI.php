<?php
include("ganon.php");
include("divisionAPI.php");

$centreHTML;
$leagueHTML;

if ($_GET["service"] == 'centre' && $_GET['id'] != null){
	loadCentreData($_GET['id']);
	echo json_encode(loadLeagues());
} else if ($_GET['service'] == 'league' && $_GET['id'] != null){
	loadLeagueData($_GET['id']);
	echo json_encode(loadDivisions());
} else if ($_GET['service'] == 'division' && $_GET['id'] != null){
	loadDivisionData($_GET['id']);
	echo json_encode(loadTeams());
} else if ($_GET['service'] == 'score' && $_GET['id'] != null){
	loadDivisionData($_GET['id']);
	echo json_encode(pastScores_By_Game());
}
//TESTING CODE
/*
loadCentreData(29);
echo "'".json_encode(loadLeagues())."'";
loadLeagueData(341);
echo '<br>';
echo "'".json_encode(loadDivisions())."'";
loadDivisionData(1655);
echo '<br>';
echo "'".json_encode(loadTeams())."'";
*/
//TESTING CODE END
function loadCentreData($id){
	global $centreHTML;
	/*global $leagueHTML;
	global $sportsCenterHTML;
	switch ($type) {
		case 'league':
			$leagueHTML = file_get_html("http://app.sportdata.com.au/results/".$id);
			break;
		case 'division':
			$divisionHTML = file_get_html("http://app.sportdata.com.au/find_leagues/".$id);
			break;
		case 'center':
			$sportsCenterHTML= file_get_html("http://app.sportdata.com.au/ind_sports/".$id);
			break;
	}*/
	$centreHTML = file_get_html("http://app.sportdata.com.au/find_sports/".$id);


}

function loadLeagues(){
			global $centreHTML;

			$responseArray = array();
			$hrefArray = $centreHTML->find('a');
			for ($i = 2; $i < count($hrefArray); $i++){

				array_push($responseArray, array('league'=> $hrefArray[$i]->plaintext,
						'id'=>str_replace('/find_leagues/', '', $hrefArray[$i]->href)
					));
			}
			return $responseArray;

}

function loadLeagueData($id){
	global $leagueHTML;
	$leagueHTML = file_get_html("http://app.sportdata.com.au/find_leagues/".$id);
}

function loadDivisions(){
	global $leagueHTML;
	$responseArray = array();
	$hrefArray = $leagueHTML->find('a');
	for ($i = 3; $i < count($hrefArray); $i++){

		array_push($responseArray, array('division'=> $hrefArray[$i]->plaintext,
				'id'=>str_replace('/results/', '', $hrefArray[$i]->href)
			));
	}
	return $responseArray;
}
