<?php
include("ganon.php");
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
class SportDataApi
{
    private $centreHTML;
    private $leagueHTML;
    private $team_count;
    private $divisionHTML;
    private $divisionDir;
    private $centreDir;
    private $teamDir;


    function loadCentreData($id)
    {
        if (!file_exists($this->centreDir . '/' . $id . '.html')) {
            $centreHTML = file_get_html("http://app.sportdata.com.au/find_sports/" . $id);
            $this->writeRawData($centreHTML, $id, $this->centreDir);
        } else {
            $centreHTML = str_get_html(file_get_contents($this->centreDir . '/' . $id . '.html'));
        }
        return $centreHTML;
    }

    function __construct(){
        $directory = '../Data/' . date('Y') . date('m') . date('d');
        $this->divisionDir = $directory . '/division';
        $this->centreDir = $directory . '/centre';
        $this->teamDir = $directory . '/team';

        $this->makeDir($this->centreDir);
        $this->makeDir($this->divisionDir);
        $this->makeDir($this->teamDir);

        $this->team_count = 0;
        $this->centreHTML = $this->loadCentreData(29);
        $this->leagueHTML;
        $this->team_count;
        $this->divisionHTML;

    }

    function loadLeagues()
    {
        $responseArray = array();
        $centreArray = array();
        $hrefArray = $this->centreHTML->find('a');
        for ($i = 2; $i < count($hrefArray); $i++) {
            $this->leagueHTML = $this->loadLeagueData(str_replace('/find_leagues/', '', $hrefArray[$i]->href));
            $divisions = $this->loadDivisions();
            array_push($centreArray, array('league' => $hrefArray[$i]->plaintext,
                'id' => str_replace('/find_leagues/', '', $hrefArray[$i]->href), 'divisions' => $divisions
            ));
        }
        array_push($responseArray, $centreArray);
        return $responseArray;
    }

    function loadLeagueData($id)
    {
        if (!file_exists($this->divisionDir . '/' . $id . '.html')) {
            $leagueHTML = file_get_html("http://app.sportdata.com.au/find_leagues/" . $id);
            $this->writeRawData($leagueHTML, $id, $this->divisionDir);
        } else {
            $leagueHTML = str_get_html(file_get_contents($this->divisionDir . '/' . $id . '.html'));
        }
        return $leagueHTML;

    }

    function loadDivisions()
    {

        $responseArray = array();
        $hrefArray = $this->leagueHTML->find('a');
        for ($i = 3; $i < count($hrefArray); $i++) {
            $this->loadDivisionData(str_replace('/results/', '', $hrefArray[$i]->href));
            array_push($responseArray, array('division' => $hrefArray[$i]->plaintext,
                'id' => str_replace('/results/', '', $hrefArray[$i]->href)
            ));
        }
        return $responseArray;
    }

    function makeDir($path)
    {
        return is_dir($path) || mkdir($path, 0777, true);
    }

    function writeRawData($content, $name, $path)
    {
        $fp = fopen($path . '/' . $name . '.html', 'w');

        if ($name == 'MasterList') {
            $content = serialize($content);
        }
        //echo 'writing: '.$path.$name;
        fwrite($fp, $content);
        fclose($fp);
    }


    function loadDivisionData($id)
    {

        if (!file_exists($this->teamDir . '/' . $id . '.html')) {
            $this->divisionHTML = file_get_html("http://app.sportdata.com.au/results/" . $id);
            $this->writeRawData($this->divisionHTML, $id, $this->teamDir);
        } else {
            $this->divisionHTML = str_get_html(file_get_contents($this->teamDir . '/' . $id . '.html'));
        }
        return $this->divisionHTML;

    }

    //echo json_encode(pastScores_By_Game());
    //echo getTeamsCount();
    function loadTeams()
    {
        $divisionHTML = $this->divisionHTML;

        $teamArray = array();
        if ($this->team_count == 0) {
            $tabArray = $divisionHTML->find('table');
            $scoretable = $tabArray[0];
            //for each of the rows found in the table loop to get data
            $tr = $scoretable->find('tr');
            for ($i = 1; $i < count($tr); $i++) {
                $td = $tr[$i]->find('td');
                array_push($teamArray, $td[0]->plaintext);
                //echo $td[0]->plaintext;
            }
            //$team_count = count($ele)-1; //remove 1 for the th row
        }

        return $teamArray;
    }


    function pastScores_By_Game()
    {
        $divisionHTML = $this->divisionHTML;

        $responseArray = array();
        $tabArray = $divisionHTML->find('table');
        //echo $tabArray[1];
        //echo $tabArray->plaintext;
        $element = $tabArray[1];
        //foreach($soccerHTML->find('table') as $element) {
        //initialize first row counter
        $thRows = $element->find('th');
        //set the SQL column insert string to be blank
        $sqlColumns = "";
        //roundinfobydate
        $roundInfo = array();
        $roundNumber = 1;
        $table_details = array('Round' => null, 'Game Date' => null, 'Team A' => null, 'Team B' => null, 'A' => null, 'B' => null, 'F' => null);
        for ($i = 0; $i < count($thRows); $i++) {
            $columnName = $thRows[$i]->plaintext;
            if ($table_details[$columnName] == null) {
                $table_details[$columnName] = $i;
            }

        }
        //for each of the rows found in the table loop to get data
        $ele = $element->find('tr');
        $gameDates = array();
        for ($i = 1; $i < count($ele); $i++) {
            //foreach($element->find('tr') as $ele) {
            $matchDetails = $ele[$i]->find('td');


            $round = $matchDetails[$table_details['Round']]->plaintext;
            $gameDate = $matchDetails[$table_details['Game Date']]->plaintext;
            $teamA = $matchDetails[$table_details['Team A']]->plaintext;
            $teamB = $matchDetails[$table_details['Team B']]->plaintext;
            $scoreA = $matchDetails[$table_details['A']]->plaintext;
            $scoreB = $matchDetails[$table_details['B']]->plaintext;
            $scoreF = $matchDetails[$table_details['F']]->plaintext;
            //If the Date isnt in the gameDates array


            //If the game isnt a bye or in the future
            if (($matchDetails[$table_details['F']])) {
                //if the round isnt added to the array yet
                if ($gameDates[$round - 1]['Round'] != $round) {
                    //add length

                    //add new data
                    array_push($gameDates, array('Round' => $round, 'Date' => $gameDate, 'length' => 0));
                }

                //add the stats to an array for the game
                $stats = array(
                    //'Round'=> $round,
                    //'Date'=> $gameDate,
                    'Team A' => $teamA,
                    'Team B' => $teamB,
                    'A' => $scoreA,
                    'B' => $scoreB,
                    'F' => $scoreF
                );
                //insert into the array at the location of the games date
                array_push($gameDates[$round - 1], $stats);

            }


        }
        for ($i = 0; $i < count($gameDates); $i++) {
            $gameDates[$i]['length'] = count($gameDates[$i]) - 3;
        }
        $responseArray = $gameDates;
        //array_push($responseArray, $gameDates);
        //array_push($responseArray, $gameDates);
        return $responseArray;

    }


    function get_numerics($str)
    {
        preg_match_all('/\d+/', $str, $matches);
        return $matches[0];
    }
}

?>