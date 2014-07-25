<?php
include("ganon.php");
include("divisionAPI.php");

$centreHTML;
$leagueHTML;
$directory = './'.date('Y').date('m').date('d');
$divisionDir = $directory.'/division';
$centreDir = $directory.'/centre';
makeDir($directory);
makeDir($divisionDir);
makeDir($centreDir);

if ($_GET["service"] == 'centre' && $_GET['id'] != null){
	loadCentreData($_GET['id']);
	echo json_encode(loadLeagues($_GET['id']));
} else if ($_GET['service'] == 'league' && $_GET['id'] != null){
	loadLeagueData($_GET['id']);
	echo json_encode(loadDivisions());
} else if ($_GET['service'] == 'division' && $_GET['id'] != null){
	loadDivisionData($_GET['id']);
	echo json_encode(loadTeams());
} else if ($_GET['service'] == 'score' && $_GET['id'] != null){
	loadDivisionData($_GET['id']);
	$scoreArray = array('Score'=>pastScores_By_Game(), 'Teams'=>loadTeams());
	echo json_encode($scoreArray);
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
	global $centreDir;
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
	
	if(!file_exists($centreDir.'/'.$id.'.html')){
		$centreHTML = file_get_html("http://app.sportdata.com.au/find_sports/".$id);
		writeRawData($centreHTML, $id, 'centre');
	} else {
		$centreHTML = str_get_html(file_get_contents($centreDir.'/'.$id.'.html'));
	}
	//echo 'errywhere';


}

function loadLeagues($centreID){
			global $centreHTML;

			$responseArray = array();
			$centreArray = array();
			$hrefArray = $centreHTML->find('a');
			for ($i = 2; $i < count($hrefArray); $i++){
				loadLeagueData(str_replace('/find_leagues/', '', $hrefArray[$i]->href));
				$divisions = loadDivisions();
				array_push($centreArray, array('league'=> $hrefArray[$i]->plaintext,
						'id'=>str_replace('/find_leagues/', '', $hrefArray[$i]->href), 'divisions'=>$divisions
					));
			}
			array_push($responseArray, $centreArray);
			return $responseArray;

}

function loadLeagueData($id){
	global $leagueHTML;
	global $divisionDir;
	if(!file_exists($divisionDir.'/'.$id.'.html')){
		$leagueHTML = file_get_html("http://app.sportdata.com.au/find_leagues/".$id);
		writeRawData($leagueHTML, $id, $divisionDir);
	} else {
		$leagueHTML = str_get_html(file_get_contents($divisionDir.'/'.$id.'.html'));
	}

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
     function makeDir($path)
    {
        return is_dir($path) || mkdir($path);
    }
         function writeRawData($content, $name, $path)
    {
        $fp = fopen($path.'/'.$name.'.html', 'w');

        if ($name == 'MasterList'){
            $content = serialize($content);
        }
        //echo 'writing: '.$path.$name;
        fwrite($fp, $content);
        fclose($fp);
    }
