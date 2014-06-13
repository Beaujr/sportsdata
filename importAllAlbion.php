<?php
include("soccer.php");
include("ganon.php");
//url for the page, league for whether is a directory or a leagues results page
loadIndoorSportsComplex("http://sportdata.com.au/find_sports/29", false);
function loadIndoorSportsComplex($url, $league){
echo $url;
$resultURL = $url;
$ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $resultURL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        $ip=rand(0,255).'.'.rand(0,255).'.'.rand(0,255).'.'.rand(0,255);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("REMOTE_ADDR: $ip", "HTTP_X_FORWARDED_FOR: $ip"));
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/".rand(3,5).".".rand(0,3)." (Windows NT ".rand(3,5).".".rand(0,2)."; rv:2.0.1) Gecko/20100101 Firefox/".rand(3,5).".0.1");
        $html = curl_exec($ch);
        curl_close($ch);
		$soccerHTML = file_get_html($resultURL);
		$firstTwoTables = 0;
		foreach($soccerHTML->find('a') as $element) {
			//echo implode("",get_numerics($element->href))."\n";
			$idNum = implode("",get_numerics($element->href));
			//echo $idNum."\n";
			if (is_numeric($idNum) == true){
				echo $idNum."\n";
				if($league == true){
					retrieveInitialLoad("http://sportdata.com.au/results/".$idNum);
				} else {
					loadIndoorSportsComplex("http://sportdata.com.au/find_leagues/".$idNum, true);
				}
			
			} else {
			
			}
		}
}
/*function get_numerics ($str) {
        preg_match_all('/\d+/', $str, $matches);
        return $matches[0];
    }*/
?>