<?php
/**
 * Created by PhpStorm.
 * User: beaurudder
 * Date: 2014-08-01
 * Time: 9:06 PM
 */


class LeagueAthleticsAPI {
    private $centreHTML;
    private $leagueHTML;
    private $team_count;
    private $divisionHTML;
    private $siteHTML;
    private $directory;
    private $divisionDir;
    private $centreDir;
    private $teamDir;
    private $teams;

    function __construct(){
        $directory = '../Data/LeagueAthletics/' . date('Y') . date('m') . date('d');
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
    function loadDivisionData($id)
    {
        $this->divisionHTML = array();
        //https://api.leagueathletics.com/api/Standings/?team=&division=16006&season=&db=&org=northvansoftball.com
        if (!file_exists($this->teamDir . '/' . $id . '.html')) {
            $divisionHTML = file_get_html("https://api.leagueathletics.com/api/Standings/?team=&division".$id."=&season=&db=&org=northvansoftball.com");
            $contentPage = json_decode($divisionHTML)[0];
            $this->writeRawData($divisionHTML, $id, $this->teamDir);
            foreach($contentPage->standings as $team){
                $page =  file_get_html("https://leagueathletics.com/results.asp?standteam=".$team->TeamID."&db=1&org=northvansoftball.com");
                #array_push($this->divisionHTML, $page->find('table[class=table-striped]', 0));
                $homeTeam = "<h1>".explode(' > ', $page->find('span[class=brand]', 1)->plaintext)[1]."</h1>";
                $this->writeRawData($homeTeam.$page->find('table[class=table-striped]', 0), $id.$team->TeamID, $this->teamDir);
                $page->clear();
            }
            #$this->writeRawData($this->divisionHTML, $id, $this->teamDir);
            #return $this->loadDivisionData($id);
        }
        $divisionHTML = str_get_html(file_get_contents($this->teamDir . '/' . $id . '.html'));
        $contentPage = json_decode($divisionHTML)[0];
        foreach($contentPage->standings as $team){
            if(!file_exists($this->teamDir . '/' . $id.$team->TeamID . '.html')){
                $page =  file_get_html("https://leagueathletics.com/results.asp?standteam=".$team->TeamID."&db=1&org=northvansoftball.com");
                $homeTeam = "<h1>".explode(' > ', $page->find('span[class=brand]', 1)->plaintext)[1]."</h1>";
                $this->writeRawData($homeTeam.$page->find('table[class=table-striped]', 0), $id.$team->TeamID, $this->teamDir);
                $page = $homeTeam.$page->find('table[class=table-striped]', 0);
            } else {
                $page = str_get_html(file_get_contents($this->teamDir . '/' . $id.$team->TeamID . '.html'));
            }
            array_push($this->divisionHTML,$page);

        }





        return $this->divisionHTML;

    }

    function loadCentreData($id)
    {

            $this->centreHTML = file_get_html("https://leagueathletics.com/Standings.asp?org=" . $id . ".com");

        return $this->centreHTML;
    }

    function pastScores_By_Game()
    {
        $divisionHTML = $this->divisionHTML;
        $gameDates = array();
        $responseArray = array();
        #$tabArray = $divisionHTML->find('table[class=table-striped]', 0);
        foreach($divisionHTML as $tabArray){
            $thRows = $tabArray->find('tr', 1)->find('td');
            //set the SQL column insert string to be blank
            $table_details = array();
            for ($i = 1; $i < count($thRows); $i++) {
                $columnName = $thRows[$i]->plaintext;
                if ($table_details[$columnName] == null) {
                    $table_details[$columnName] = $i;
                }

            }
            //for each of the rows found in the table loop to get data
            $ele = $tabArray->find('tr');

            $rounds = count($ele);
            $teams = array();
            array_push($teams,'Ravens');
            for ($i = 2; $i < count($ele); $i++) {
                //foreach($element->find('tr') as $ele) {
                $matchDetails = $ele[$i]->find('td');



                $gameDate =  str_replace("&nbsp;", "", trim($matchDetails[$table_details['Date']]->plaintext));
                $gameDate = date('d M Y', strtotime($gameDate));
                $round = strtotime(date('d M Y', strtotime($gameDate)));
                $teamA = trim($tabArray->find('h1', 0)->plaintext);

                $teamB =  trim(str_replace("&nbsp;", "", trim($matchDetails[$table_details['Opponent']]->plaintext)));
                $scoreA = preg_replace("/[^0-9,.]/", "", trim($matchDetails[$table_details['RF']]->plaintext));
                $scoreB = preg_replace("/[^0-9,.]/", "", trim($matchDetails[$table_details['RA']]->plaintext));
                $scoreF = ($matchDetails[$table_details['F']]->plaintext == null) ? "" :$matchDetails[$table_details['F']]->plaintext ;

                $wlt = $matchDetails[$table_details['W/L/T']]->plaintext;
                $wlt = str_replace("&nbsp;", "", trim($wlt));
                //If the game isnt a bye or in the future
                if ($wlt != "") {
                    $gameExists = false;
                    if ($gameDates[$round] == null){
                        $gameDates[$round] = array('Round' => $round, 'Date' => $gameDate, 'length' => 0);
                    } else {
                       # $gameDates[$round]['length']++;
                        foreach($gameDates[$round] as $gm){
                            if(is_array($gm)){
                                if($teamA == $gm['Team B'] && $teamB == $gm['Team A'] && $scoreB == $gm['A'] && $scoreA == $gm['B']){
                                    //Game Already Exists
                                    $gameExists = true;
                                }
                            }
                        }
                    }
                    #$gameDates[$round] = array('Round' => $round, 'Date' => $gameDate, 'length' => 0);
                    array_push($teams,$teamB);
                    $this->teams = $teams;

                    $stats = array(
                        //'Round'=> $round,
                        //'Date'=> $gameDate,
                        'Team A' => $teamA,
                        'Team B' => $teamB,
                        'A' => $scoreA,
                        'B' => $scoreB,
                        'F' => $scoreF
                    );
                    if(!$gameExists){
                        // 'add 'er 'on 'da 'stack
                        array_push($gameDates[$round], $stats);
                        $gameDates[$round]['length']++;
                    }
                }


            }
        }
        $responseArray = array();
        function my_sort($a,$b)
        {
            return $a['Round'] - $b['Round'];
        }


        usort($gameDates,"my_sort");
        foreach($gameDates as $gm){
            array_push($responseArray, $gm);
        }
        $this->teams = array();
        $teams = array_unique($teams);
        foreach($teams as $tm){
            array_push($this->teams, $tm);
        }
        //$this->teams = array_unique($teams);
        return (array) $responseArray;

    }
    public function loadTeams(){
        return $this->teams;
    }

    public function generateScores(){

    }
    function writeRawData($content, $name, $path, $fileExtension = '.html')
    {
        $fp = fopen($path . '/' . $name . $fileExtension, 'w');
        //echo 'writing: '.$path.$name;
        fwrite($fp, $content);
        fclose($fp);
    }
    function makeDir($path)
    {
        return is_dir($path) || mkdir($path, 0777, true);
    }

    function loadSiteData(){

        $site = array();
        $sites = array();
        array_push($sites, array('name'=>"North Vancouver Softball", "id"=> "northvansoftball"));
        array_push($site, array('leagues'=>$sites, 'name'=>'LeagueAthletics', 'id'=>'LeagueAthletics'));


        $this->siteHTML = $site[0];
        return $this->siteHTML;
    }

    function loadSite(){

        $hrefArray = $this->siteHTML;

        return $hrefArray;
    }

    function loadLeagues(){
        $centreHTML = $this->centreHTML;

        $centreArray = new stdClass();
        $centreArray->name = explode(' | ', $centreHTML->find('title',0)->plaintext)[1];
        $centreArray->id = strtolower(str_replace(" ", "", explode(' | ', $centreHTML->find('title',0)->plaintext)[1]));
        $centreArray->leagues = array();

        $leagueArray = array();
        $responseArray = array();
        $selArray = $centreHTML->find('select[name=Seasons]', 0)->find('option');
        for($i =1; $i < count($selArray); $i++){
            $leagueId = $selArray[$i]->value;
            $leagueName = $selArray[$i]->plaintext;
            $this->loadLeagueData($leagueId, $centreArray->id);
            $divisions = $this->loadDivisions();
            array_push($centreArray->leagues, array('league' => $leagueName,
                'id' => $leagueId, 'divisions' => $divisions
            ));
        }
        //array_push($centreArray, array('name'=>$centreName, 'id'=>$centreId, 'leagues'=>$leagueArray));
        return (array) $centreArray;


    }
    function loadLeagueData($id, $site){
        //https://api.leagueathletics.com/api/Standings/?team=&division=&season=8666&db=&org=northvansoftball.com
        $this->leagueHTML = file_get_html("https://api.leagueathletics.com/api/Standings/?team=&division=&season=" . $id . "&db=&org=".$site.".com");

        return $this->leagueHTML;
    }
    function loadDivisions (){
        $divisions = json_decode($this->leagueHTML);
        $response = array();
        //(String) division, (Int) id, (Array) teams
        foreach($divisions as $division){
            $name = explode(' > ', $division->divisionName)[1];
            $id = $division->divisionID;
            $teams = array();
            foreach($division->standings as $team){
                array_push($teams, $team->Team);
            }
            array_push($response, array('division' => $name,
                'id' => $id, 'teams' => $teams));
        }
        return $response;
    }
}
