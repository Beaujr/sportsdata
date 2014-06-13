<?php
include("ganon.php");
$mysql_host = "mysql9.000webhost.com";
$mysql_database = "a6783177_soccer";
$mysql_user = "a6783177_soccer";
$mysql_password = "greywolf9";
retrieveInitialLoad('http://app.sportdata.com.au/results/1655');

function getConnected() {

   $mysqli = new mysqli("mysql9.000webhost.com", "a6783177_soccer", "greywolf9", "a6783177_soccer");

   if($mysqli->connect_error) 
     die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());

   return $mysqli;
}
//$link = mysqli_connect($mysql_host,$mysql_user,$mysql_password,$mysql_database) or die("Error " . mysqli_error($link));
		//$url= "http://sportdata.com.au/results/292";
		//retrieveInitialLoad($url);
function retrieveInitialLoad($resultURL){ 
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
		foreach($soccerHTML->find('table') as $element) {
			//foreach($element->find('td') as $ele){
			//	echo $ele;
			//}
			$firstTwoTables++;
			$firstRow = 0;
			$sqlColumns = "";
			foreach($element->find('tr') as $ele) {
				if ($firstRow == 0){
				if ($firstTwoTables < 2){
				$sqlColumns = $sqlColumns."insert into team_scores ";
				}
				else {
				$sqlColumns = $sqlColumns."insert into game_schedule ";
				}
				$first = 0;
				
				foreach($ele->find('th') as $el) {
					if($first == 0){
						//$sqlColumns = $sqlColumns.$el->plaintext;
					} else {
						//$sqlColumns = $sqlColumns." ,".$el->plaintext;
					}
					$first= 1;
					
				}
				$sqlColumns = $sqlColumns." VALUES ('";
				
				 } else {
					
					$sqlRows = "";
					$first = 0;
					$lastCell;
					foreach($ele->find('td') as $el) {
					
						if($first == 0){
							$sqlRows=$sqlRows.$el->plaintext;
						} else {
							$sqlRows=$sqlRows."','".$el->plaintext;
							$lastCell = $el->plaintext;
						}
						
						$first= 1;
					}
					$sqlRows=$sqlRows."','".implode("",get_numerics($resultURL));
					if($firstTwoTables == 2){
						$sqlColumnsT2 = $sqlColumns;
						if(strrpos($lastCell, "PM") === false){
							$sqlColumnsT2= str_replace("game_schedule", "past_games",$sqlColumns);
							
						} else {
							//A ,B ,
							$sqlColumnsT2= str_replace("A ,B ,F","Court ,Time",$sqlColumns);
							//echo $sqlColumns;
							
						}
						//Execute SQL here
						echo $sqlColumnsT2.$sqlRows."');<br>\n";
						   //$mysqli = new mysqli("mysql9.000webhost.com", "a6783177_soccer", "greywolf9", "a6783177_soccer");
					/*
					   if($mysqli->connect_error) 
						 die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
						$result = mysqli_query($mysqli,$sqlColumnsT2.$sqlRows."')"); 
						$mysqli->close();
						*/
						
					} else {
					////Execute SQL here
					
					/*echo $sqlColumns;
					echo $sqlRows."');<br>\n";
					 $mysqli = new mysqli("mysql9.000webhost.com", "a6783177_soccer", "greywolf9", "a6783177_soccer");

					   if($mysqli->connect_error) 
						 die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
					$result = mysqli_query($mysqli,$sqlColumns.$sqlRows."')"); 
					$mysqli->close(); */
					}
					//echo "');<br>\n";
				}
				$firstRow = 1;
				//echo $ele;
			}
			//echo $element, "<br>\n\n\n\n\n\n\n\n";
			echo  "<br>\n\n\n\n\n\n\n\n";
			if ($firstTwoTables == 2){
				break;
			}
			
		}
}
function get_numerics ($str) {
        preg_match_all('/\d+/', $str, $matches);
        return $matches[0];
    }
		
		?>