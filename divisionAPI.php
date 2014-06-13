<?php

$team_count = 0;
$divisionHTML;
function loadDivisionData($id){
	global $divisionHTML;
	$divisionHTML = file_get_html("http://app.sportdata.com.au/results/".$id);


}

//echo json_encode(pastScores_By_Game());
//echo getTeamsCount();
function loadTeams(){
	global $divisionHTML;
	$teamArray = array();
	if($team_count == 0){
			$tabArray = $divisionHTML->find('table');
			$scoretable = $tabArray[0];
			//for each of the rows found in the table loop to get data
			$tr = $scoretable->find('tr');
			for($i =1; $i < count($tr); $i++){
				$td = $tr[$i]->find('td');
				array_push($teamArray, $td[0]->plaintext);
				//echo $td[0]->plaintext;
			}
			//$team_count = count($ele)-1; //remove 1 for the th row
	}
	return $teamArray;
}


function pastScores_By_Game(){
			global $divisionHTML;

			$responseArray = array();
			$tabArray = $divisionHTML->find('table');
			echo $tabArray->plaintext;
			$element = $tabArray[1];
		//foreach($soccerHTML->find('table') as $element) {			
			//initialize first row counter
			$thRows = $element->find('th');
			//set the SQL column insert string to be blank
			$sqlColumns = "";
			//roundinfobydate
			$roundInfo= array();
			$roundNumber=1;
			$table_details = array('Round'=>null, 'Game Date'=>null, 'Team A'=>null, 'Team B'=>null, 'A'=>null, 'B'=>null, 'F'=>null);
			for($i =0; $i<count($thRows); $i++){
							$columnName = $thRows[$i]->plaintext;
							if($table_details[$columnName] == null){
								$table_details[$columnName] = $i;
							}
							
			}
			//for each of the rows found in the table loop to get data
			$ele = $element->find('tr');
			$gameDates = array();
			for($i=1; $i< count($ele);$i++){
			//foreach($element->find('tr') as $ele) {
					$matchDetails = $ele[$i]->find('td');
					

					$round= $matchDetails[$table_details['Round']]->plaintext;
					$gameDate= $matchDetails[$table_details['Game Date']]->plaintext;
					$teamA = $matchDetails[$table_details['Team A']]->plaintext;
					$teamB = $matchDetails[$table_details['Team B']]->plaintext;
					$scoreA = $matchDetails[$table_details['A']]->plaintext;
					$scoreB = $matchDetails[$table_details['B']]->plaintext;
					$scoreF = $matchDetails[$table_details['F']]->plaintext;
					//If the Date isnt in the gameDates array

						
					
					

					//If the game isnt a bye or in the future
					if(($matchDetails[$table_details['F']])){
						//if the round isnt added to the array yet
						if($gameDates[$round-1]['Round'] != $round){
							//add length

							//add new data
							array_push($gameDates,array('Round'=>$round, 'Date'=>$gameDate, 'length'=>0));
						}

						//add the stats to an array for the game
						$stats = array(
							//'Round'=> $round,
							//'Date'=> $gameDate,
							'Team A'=> $teamA,
							'Team B'=> $teamB,
							'A'=> $scoreA,
							'B'=> $scoreB,
							'F'=> $scoreF
						);
						//insert into the array at the location of the games date
						array_push($gameDates[$round-1], $stats);
						
					}


			}
			for($i=0; $i < count($gameDates); $i++){
				$gameDates[$i]['length'] = count($gameDates[$i]) - 3;
			}
			$responseArray = $gameDates;
			//array_push($responseArray, $gameDates);
			//array_push($responseArray, $gameDates);
			return $responseArray;

}


function get_numerics ($str) {
        preg_match_all('/\d+/', $str, $matches);
        return $matches[0];
    }
		
		?>