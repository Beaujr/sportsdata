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
    private $siteHTML;
    private $directory;
    private $divisionDir;
    private $centreDir;
    private $teamDir;


    function loadCentreData($id)
    {
        if (!file_exists($this->centreDir . '/' . $id . '.html')) {
            $this->centreHTML = file_get_html("http://app.sportdata.com.au/find_sports/" . $id);
            $this->writeRawData($this->centreHTML, $id, $this->centreDir);
        } else {
            $this->centreHTML = str_get_html(file_get_contents($this->centreDir . '/' . $id . '.html'));
        }
        return $this->centreHTML;
    }

    function __construct(){
        $directory = '../Data/SportData/' . date('Y') . date('m') . date('d');
        $this->directory = $directory;
        $this->divisionDir = $directory . '/division';
        $this->centreDir = $directory . '/centre';
        $this->teamDir = $directory . '/team';

        $this->makeDir($this->centreDir);
        $this->makeDir($this->divisionDir);
        $this->makeDir($this->teamDir);

        $this->team_count = 0;
        $this->centreHTML;
        $this->leagueHTML;
        $this->team_count;
        $this->divisionHTML;

    }
    function loadSiteData(){
        if (!file_exists($this->directory . '/all.html')) {
            $this->siteHTML = file_get_html("http://app.sportdata.com.au/find");
            $this->writeRawData($this->siteHTML, "all", $this->directory);
        } else {
            $this->siteHTML = str_get_html(file_get_contents($this->directory . '/all.html'));
        }
        return $this->siteHTML;
    }

    function loadSite(){
        $siteName =  'SportData';
        $responseArray = array();
        if (!file_exists($this->directory . '/' . $siteName . '.json')) {
            $hrefArray = $this->siteHTML->find('ul',0)->find('a');
            $siteArray = array();
            for ($i = 0; $i < count($hrefArray); $i++) {
                //$this->centreHTML = $this->loadCentreData(str_replace('/find_sports/', '', $hrefArray[$i]->href));
                //$centres = $this->loadLeagues();
                array_push($siteArray, array('name' => $hrefArray[$i]->plaintext,
                    'id' => str_replace('/find_sports/', '', $hrefArray[$i]->href)
                ));

            }
            $responseArray = array('name'=>$siteName, 'leagues' => $siteArray);
            $this->writeRawData(serialize($responseArray), $siteName, $this->centreDir, '.json');
        } else {
            $responseArray = unserialize(str_get_html(file_get_contents($this->centreDir . '/' . $siteName . '.json')));
        }
        return $responseArray;
    }
    function loadLeagues()
    {
        $centreName =  $this->centreHTML->find('title',0)->plaintext;
        $responseArray = array();
        if (!file_exists($this->centreDir . '/' . $centreName . '.json')) {
            $hrefArray = $this->centreHTML->find('a');
            $centreArray = array();
            for ($i = 2; $i < count($hrefArray); $i++) {
                $this->leagueHTML = $this->loadLeagueData(str_replace('/find_leagues/', '', $hrefArray[$i]->href));
                $divisions = $this->loadDivisions();
                array_push($centreArray, array('league' => $hrefArray[$i]->plaintext,
                    'id' => str_replace('/find_leagues/', '', $hrefArray[$i]->href), 'divisions' => $divisions
                ));
            }
            $responseArray = array('name'=>$centreName, 'leagues' => $centreArray);
            $this->writeRawData(serialize($responseArray), $centreName, $this->centreDir, '.json');
        } else {
            $responseArray = unserialize(str_get_html(file_get_contents($this->centreDir . '/' . $centreName . '.json')));
        }
        return $responseArray;

    }

    function loadLeagueData($id)
    {
        if (!file_exists($this->divisionDir . '/' . $id . '.html')) {
            $this->leagueHTML = file_get_html("http://app.sportdata.com.au/find_leagues/" . $id);
            $this->writeRawData($this->leagueHTML, $id, $this->divisionDir);
        } else {
            $this->leagueHTML = str_get_html(file_get_contents($this->divisionDir . '/' . $id . '.html'));
        }
        return $this->leagueHTML;

    }

    function loadDivisions()
    {

        $responseArray = array();
        $hrefArray = $this->leagueHTML->find('a');

        for ($i = 3; $i < count($hrefArray); $i++) {
            $this->loadDivisionData(str_replace('/results/', '', $hrefArray[$i]->href));
            $teams = $this->loadTeams();
            array_push($responseArray, array('division' => $hrefArray[$i]->plaintext,
                'id' => str_replace('/results/', '', $hrefArray[$i]->href), 'teams' => $teams)
            );
        }
        return $responseArray;
    }

    function makeDir($path)
    {
        return is_dir($path) || mkdir($path, 0777, true);
    }

    function writeRawData($content, $name, $path, $fileExtension = '.html')
    {
        $fp = fopen($path . '/' . $name . $fileExtension, 'w');
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
            if ($scoreF == "" && $round != "none") {
                //if the round isnt added to the array yet
                if ($gameDates[$round - 1]['Round'] != $round && $round != "none") {
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
               // if($round != "none"){
                    array_push($gameDates[$round - 1], $stats);
                    $gameDates[$round - 1]['length']++;
              //  }

            }


        }
        /*
        for ($i = 0; $i < count($gameDates); $i++) {
            $gameDates[$i]['length'] = count($gameDates[$i]) - 3;
        }*/
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