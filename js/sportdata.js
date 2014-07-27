//If your team is blank, you are the jimmy rustlers!
//TODO: set to first team in the division
var myTeam;
var id;
var teamColours= [];
var donutArray = [];
function setColours(){
    for(i = 0; i < teams.length; i++){
        teamColours[teams[i]] = Highcharts.getOptions().colors[i];
        
    }
}
function init(id,team){
  myTeam = team;
  id = id;
  $.getJSON( "PHP/API.php?service=score&id="+id, function( data ) {
    score_by_games = data['Score'];
    teams=data['Teams'];
    myTeam = (myTeam == undefined) ? teams[0] : myTeam;
    //$('.services.bg-primary').find('h2').text(myTeam);
    //$('.call-to-action.bg-primary').find('h1').text(myTeam+" play at:");
    setColours();
    plotWinsIncremental();
    generateDonuts();
  });
  $('.navbar li').click(function(e) {
      $('.navbar li.active').removeClass('active');
      var $this = $(this);
      if (!$this.hasClass('active')) {
          $this.addClass('active');
      }
      e.preventDefault();
  });

/*
      if(myTeam == ''){
          $('#mymodal').modal('show');
          var list_league_id = 'list-centre'; //first select list ID
          var list_division_id = 'list-leagues'; //second select list ID
          var list_teams_id = 'list-teams'; //second select list ID
         
          <?php  
    include("SportDataAPI.php");
    loadCentreData(29);
    $league = loadLeagues(29);
    echo 'var initial_target_html = \'"';
    echo '<option value="">Please select a league...</option>'; 
    for ($i = 0; $i < count($league[0]); $i++){
      echo '<option value="'.$league[0][$i]['id'].'">'.$league[0][$i]['league'].'</option>';
    }
    echo '"\';';
    echo '';
    echo 'var centreData = '.json_encode($league[0]).';';

          ?>//Initial prompt for target select
         
          $('#'+list_league_id).html(initial_target_html); //Give the target select the prompt option
         
          $('#'+list_league_id).change(function(e) {
            //Grab the chosen value on first select list change
            var selectvalue = $(this).val();
         
            //Display 'loading' status in the target select list
            $('#'+list_division_id).html('<option value="">Loading...</option>');
         
            if (selectvalue == "") {
                //Display initial prompt in target select if blank value selected
               $('#'+list_division_id).html(initial_target_html);
            } else {
              //Make AJAX request, using the selected value as the GET
              $.ajax({url: 'SportDataAPI.php?service=league&id='+$('#list-centre').val(),
                     success: function(output) {
                        //alert(output);
                        $('#'+list_division_id).html(output);
                        daySelect = document.getElementById(list_division_id);
                        var data = JSON.parse(output);
                        daySelect.options[daySelect.options.length] = new Option("Please Select", "");
                        for (i = 0; i < data.length; i++){
                            daySelect.options[daySelect.options.length] = new Option(data[i]['division'], data[i]['id']);
                        }
                        
                    },
                  error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status + " "+ thrownError);
                  }});
                }
            });
          $('#'+list_division_id).change(function(e) {
            //Grab the chosen value on first select list change

             var selectvalue = $(this).val();
         
            //Display 'loading' status in the target select list
            $('#'+list_teams_id).html('<option value="">Loading...</option>');
         
            if (selectvalue == "") {
                //Display initial prompt in target select if blank value selected
               $('#'+list_teams_id).html(initial_target_html);
            } else {
              //Make AJAX request, using the selected value as the GET
              $.ajax({url: 'SportDataAPI.php?service=division&id='+$('#list-leagues').val(),
                     success: function(output) {
                        //alert(output);
                        $('#'+list_teams_id).html(output);
                        daySelect = document.getElementById(list_teams_id);
                        var data = JSON.parse(output);
                        daySelect.options[daySelect.options.length] = new Option("Please Select", "");
                        for (i = 0; i < data.length; i++){
                            daySelect.options[daySelect.options.length] = new Option(data[i], data[i]);
                        }
                        
                    },
                  error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status + " "+ thrownError);
                  }});
                }
            });
             $('#'+list_teams_id).change(function(e) {
            window.location.search += "&id="+$('#list-leagues').val()+"&team="+$(this).val();
             });
    }*/

}
function generateDonuts(){
   var options = {
      //Boolean - Whether we should show a stroke on each segment
      segmentShowStroke : true,
      //String - The colour of each segment stroke
      segmentStrokeColor : "#fff",
      //Number - The width of each segment stroke
      segmentStrokeWidth : 2,
      //Number - The percentage of the chart that we cut out of the middle
      percentageInnerCutout : 50, // This is 0 for Pie charts
      //Number - Amount of animation steps
      animationSteps : 100,
      //String - Animation easing effect
      animationEasing : "easeOutBounce",
      //Boolean - Whether we animate the rotation of the Doughnut
      animateRotate : true,
      //Boolean - Whether we animate scaling the Doughnut from the centre
      animateScale : false,
      //String - A legend template
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
  };
    if (donutArray.length == 0) {
        donutArray.push({object : chartFactory("lastMatch", options, "lastMatchDonut", "doughnut"), update: 'lastMatchDonut' });
        donutArray.push({object : chartFactory("winsvLosses", options, "winsvLossesDonut", "doughnut"), update: 'winsvLossesDonut' });
        donutArray.push({object : chartFactory("forAgainst", options, "forAgainstDonut", "doughnut"), update: 'forAgainstDonut' });
        donutArray.push({object : chartFactory("winsLadder", options, "winsLadderPolar", "polar"), update: 'winsLadderPolar' });
    }else{
        for(var i = 0; i < donutArray.length; i++){
            donutArray[i].object.update(window[donutArray[i].update]());
        }
    }

}

function chartFactory (div, options, data, type){
    var ctx = document.getElementById(div).getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    data = window[data]();
    if (type == 'doughnut'){
        return new Chart(ctx).Doughnut(data,options);
    }
    if (type == 'polar'){
        return new Chart(ctx).PolarArea(data,options);
    }
    return false;
}

function lastMatchDonut(){
   var data = [];
   //For all the games played so far
    for(i = score_by_games.length-1; i >=0 ;i--){
        //For all the data in the match
      if(data.length != 0){
        break;
      }
      for(x = score_by_games[i].length-1; x >=0; x--){ 
        //Team A 
        var teamA = score_by_games[i][x]["Team A"];
        //TEAM B
        var teamB = score_by_games[i][x]["Team B"];
        if (teamA == myTeam){
          data = [
              {
                  value: parseInt(score_by_games[i][x]["B"]),
                  color:"#F7464A",
                  highlight: "#FF5A5E",
                  label: 'Them'
              },
              {
                  value: parseInt(score_by_games[i][x]["A"]),
                  color: "#46BFBD",
                  highlight: "#5AD3D1",
                  label: 'You'
              }
          ];
          $('#lastMatch').parent().parent().find('p').text('Against: '+teamB);
          break;
        } else if (teamB == myTeam){
          data = [
              {
                  value: parseInt(score_by_games[i][x]["A"]),
                  color:"#F7464A",
                  highlight: "#FF5A5E",
                  label: 'Them'
              },
              {
                  value: parseInt(score_by_games[i][x]["B"]),
                  color: "#46BFBD",
                  highlight: "#5AD3D1",
                  label: 'You'
              }
          ];
          $('#lastMatch').parent().parent().find('p').text('Against: '+teamA);
          break;
        }
      }
    }
  return data;
}
//forAgainst
function winsvLossesDonut(){
  var wins = 0;
  var losses = 0;
  var draw = 0;
  //For all the games played so far
  for(i = 0; i < score_by_games.length;i++){
    for(x = 0; x<score_by_games[i].length; x++){ 
      
      var teamA = score_by_games[i][x]["Team A"];
      var teamB = score_by_games[i][x]["Team B"];
      if (teamA == myTeam || teamB == myTeam){
        if(parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])){
          wins = (teamA == myTeam) ? wins + 1 : wins;
          losses = (teamB == myTeam) ? losses + 1 : losses;
        } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])){
          wins = (teamB == myTeam) ? wins + 1 : wins;
          losses = (teamA == myTeam) ? losses + 1 : losses;
        } else {//DRAW
          draw++;
        }
      } 
    }
  }
  var data = [
    {
      value: losses,
      color:"#F7464A",
      highlight: "#FF5A5E",
      label: 'Losses'
    },
    {
      value: wins,
      color: "#46BFBD",
      highlight: "#5AD3D1",
      label: 'Wins'
    },
    {
      value: draw,
      color: "#00B2EE",
      highlight: "#B2DFEE",
      label: 'Draw'
    }
  ];
  return data;
}
function forAgainstDonut(){
  var scored = 0;
  var missed = 0;
  //For all the games played so far
  for(i = 0; i < score_by_games.length;i++){
    for(x = 0; x<score_by_games[i].length; x++){ 
      
      var teamA = score_by_games[i][x]["Team A"];
      var teamB = score_by_games[i][x]["Team B"];
        if (teamA == myTeam){
          scored+= parseInt(score_by_games[i][x]["A"]);
          missed+= parseInt(score_by_games[i][x]["B"])
        } else if (teamB == myTeam){
          scored+= parseInt(score_by_games[i][x]["B"]);
          missed+= parseInt(score_by_games[i][x]["A"])
        } 
      
    
      
    
    }
  }
  var data = [
    {
      value: missed,
      color:"#F7464A",
      highlight: "#FF5A5E",
      label: 'Missed'
    },
    {
      value: scored,
      color: "#46BFBD",
      highlight: "#5AD3D1",
      label: 'Scored'
    }
  ];
    return data;
}

function winsLadderPolar(){

  var teamArray = [];
  //For all the games played so far
  for(i = 0; i < score_by_games.length;i++){
    for(x = 0; x<score_by_games[i].length; x++){ 
      
      var teamA = score_by_games[i][x]["Team A"];
      var teamB = score_by_games[i][x]["Team B"];
      if(teamArray[teamA] == undefined){
        teamArray[teamA] = 0;
      } 
          //ADD Team B to the Team Array
      if(teamArray[teamB] == undefined){
        teamArray[teamB] = 0;
      }
      if(parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])){
       teamArray[teamA]++;
      } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])){
       teamArray[teamB]++;
      } else {//DRAW
        //WE DONT CARE BOUT DRAWS
      }
      
    
      
    
    }
  }
  var data = [];
  for (var i in teamArray) {
    data.push({
      value: teamArray[i],
      color: teamColours[i],
      highlight: teamColours[i],
      label: i
    });
  }
    return data;
}
//Empty the graphs data
function cleanRemoveAllSeries(){
    while($('#graphs').highcharts().series.length > 0)
        $('#graphs').highcharts().series[0].remove(true);
    	
}
/**
 * Plots a running total week by week of the goals scored by the team
 * 
 */

function plotGoalsIncrement(){
   var teamArray = {};
   var dataArray = [];
   var teamCounter = 0;
   //For all the games played so far
    for(i = 0; i < score_by_games.length;i++){
        //For all the data in the match
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		//Team A 
    		var teamA = score_by_games[i][x]["Team A"];
    		//TEAM B
            var teamB = score_by_games[i][x]["Team B"];
    		//Add Team A to the Team Array
            if(teamArray[teamA] == undefined){
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], visible: (myTeam==teamA) ? true: false, color: teamColours[teamA]})
                teamCounter++;
    		} 
            //ADD Team B to the Team Array
    		if(teamArray[teamB] == undefined){
    			teamArray[teamB] = teamCounter;
    			dataArray.push({name: teamB, data: [], visible: (myTeam==teamB) ? true: false, color: teamColours[teamB]})
    			teamCounter++;
    		}
            //If the team already has a goal recorded 
			if (dataArray[teamArray[teamA]].data.length > 0){
                //Get the total from the last game
				var teamRunningTotal = dataArray[teamArray[teamA]].data[dataArray[teamArray[teamA]].data.length-1][1];
				//Add it to this matchs score
                teamRunningTotal+=parseInt(score_by_games[i][x]["A"]);
                //Store the new total for this week
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), parseInt(teamRunningTotal)]);
			} else {
                //We are at Game 1 so store the Teams goal score
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["A"])]);
			}
            //SAME as above for Team B instead of team A
			if(dataArray[teamArray[teamB]].data.length > 0){
				var teamRunningTotal = dataArray[teamArray[teamB]].data[dataArray[teamArray[teamB]].data.length-1][1];
				teamRunningTotal += parseInt(score_by_games[i][x]["B"]);
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), parseInt(teamRunningTotal)]);
			} else{
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["B"])]);
			}
		
    	}
    }

    //Clean out the data in the graph
    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    //Set the graphs Title
    $('#graphs').highcharts().setTitle({text: "Running total of Goals Scored By Week"});
    //Redraw the graph with the new data
       $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}
function plotGoalsPerWeek(){
   var teamArray = {};
   var dataArray = [];
   var teamCounter = 0;
    for(i = 0; i < score_by_games.length;i++){
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		
    		var teamA = score_by_games[i][x]["Team A"];
    		var teamB = score_by_games[i][x]["Team B"];
    		if(teamArray[teamA] == undefined){
    			teamArray[teamA] = teamCounter;
    			dataArray.push({name: teamA, data: [], visible: (myTeam==teamA) ? true: false, color: teamColours[teamA]})
    			teamCounter++;
    		} 

    		if(teamArray[teamB] == undefined){
    			teamArray[teamB] = teamCounter;
    			dataArray.push({name: teamB, data: [], visible: (myTeam==teamB) ? true: false, color: teamColours[teamB]})
    			teamCounter++;
    		}

			dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["A"])]);
			dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["B"])]);
			
		
    	}
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Goals Scored Each Game"});
   $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}

function plotWinLossMargins(){
   var teamArray = {};
   var dataArray = [];
   var teamCounter = 0;
    for(i = 0; i < score_by_games.length;i++){
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		
    		var teamA = score_by_games[i][x]["Team A"];
    		var teamB = score_by_games[i][x]["Team B"];
    		if(teamArray[teamA] == undefined){
    			teamArray[teamA] = teamCounter;
    			dataArray.push({name: teamA, data: [], visible: (myTeam==teamA) ? true: false, color: teamColours[teamA]})
    			teamCounter++;
    		} 

    		if(teamArray[teamB] == undefined){
    			teamArray[teamB] = teamCounter;
    			dataArray.push({name: teamB, data: [], visible: (myTeam==teamB) ? true: false, color: teamColours[teamB]})
    			teamCounter++;
    		}
			var teamAScore = parseInt(score_by_games[i][x]["A"]);
			var teamBScore = parseInt(score_by_games[i][x]["B"]);
			if(teamAScore > teamBScore){
				teamAScore = teamAScore - teamBScore;
				teamBScore = teamAScore * -1;
			} else if (teamAScore < teamBScore){
				teamBScore = teamBScore - teamAScore;
				teamAScore = teamBScore  * -1;
			} else {
				teamAScore = 0;
				teamBScore = 0;
			}		
			dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamAScore]);
			dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamBScore]);
			
		
    	}
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Weekly Win / Loss Margin"});
   $('#graphs').highcharts().yAxis[0].setExtremes();
    $('#graphs').highcharts().redraw();
}

function plotGoalsMarginsIncremental(){
   var teamArray = {};
   var dataArray = [];
   var teamCounter = 0;

   var teamRunningTotalA=0;
   var teamRunningTotalB=0;

    for(i = 0; i < score_by_games.length;i++){
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		
    		var teamA = score_by_games[i][x]["Team A"];
    		var teamB = score_by_games[i][x]["Team B"];

			if(teamArray[teamA] == undefined){
    			teamArray[teamA] = teamCounter;
    			dataArray.push({name: teamA, data: [], visible: (myTeam==teamA) ? true: false, color: teamColours[teamA]})
    			teamCounter++;
    		} 

    		if(teamArray[teamB] == undefined){
    			teamArray[teamB] = teamCounter;
    			dataArray.push({name: teamB, data: [], visible: (myTeam==teamB) ? true: false, color: teamColours[teamB]})
    			teamCounter++;
    		}
    		

				var teamAScore = parseInt(score_by_games[i][x]["A"]);
				var teamBScore = parseInt(score_by_games[i][x]["B"]);
				if(teamAScore > teamBScore){
					teamAScore = teamAScore - teamBScore;
					teamBScore = teamAScore * -1;
				} else if (teamAScore < teamBScore){
					teamBScore = teamBScore - teamAScore;
					teamAScore = teamBScore  * -1;
				} else {
					teamAScore = 0;
					teamBScore = 0;
				}

				if (dataArray[teamArray[teamA]].data.length > 0){
					teamRunningTotalA = dataArray[teamArray[teamA]].data[dataArray[teamArray[teamA]].data.length-1][1];			
				} 
				if (dataArray[teamArray[teamB]].data.length > 0){
					teamRunningTotalB = dataArray[teamArray[teamB]].data[dataArray[teamArray[teamB]].data.length-1][1];
				} 
				
					dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamAScore+teamRunningTotalA]);
					
				
					dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamBScore+teamRunningTotalB]);

			
		
    	}
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Running Weekly Total of (Goals Scored - Goals Against)"});
    $('#graphs').highcharts().yAxis[0].setExtremes();
    $('#graphs').highcharts().redraw();
}

function plotWinsLosses(){
	//$('.nav a:contains("pWinsLossPw")').tab('show');
   var teamArray = {};
   var dataArray = [];
   var teamCounter = 0;
    for(i = 0; i < score_by_games.length;i++){
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		
    		var teamA = score_by_games[i][x]["Team A"];
    		var teamB = score_by_games[i][x]["Team B"];
    		if(teamArray[teamA] == undefined){
    			teamArray[teamA] = teamCounter;
    			dataArray.push({name: teamA, data: [], visible: (myTeam==teamA) ? true: false, color: teamColours[teamA]})
    			teamCounter++;
    		} 

    		if(teamArray[teamB] == undefined){
    			teamArray[teamB] = teamCounter;
    			dataArray.push({name: teamB, data: [], visible: (myTeam==teamB) ? true: false, color: teamColours[teamB]})
    			teamCounter++;
    		}
    		if(parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])){
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 1]);
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0]);
    		} else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])){
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0]);
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 1]);
    		} else {//DRAW
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0.5]);
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0.5]);
    		}
			
		
    	}
    }

    //return dataArray;
    cleanRemoveAllSeries();
    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    
    
 	$('#graphs').highcharts().setTitle({text: "Wins vs Losses per Week"});
      $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}
function plotCompareTwoTeams(CompareA, CompareB){
   var teamArray = {};
   var dataArray = [];
   var teamCounter = 0;
    for(i = 0; i < score_by_games.length;i++){
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		
    		var teamA = score_by_games[i][x]["Team A"];
    		var teamB = score_by_games[i][x]["Team B"];

    		if((teamA == CompareA || teamA == CompareB) && (teamB == CompareA || teamB == CompareB)){
	    		if(teamArray[teamA] == undefined){
	    			teamArray[teamA] = teamCounter;
	    			dataArray.push({name: teamA, data: [], color: teamColours[teamA]});
	    			teamCounter++;
	    		} 

	    		if(teamArray[teamB] == undefined){
	    			teamArray[teamB] = teamCounter;
	    			dataArray.push({name: teamB, data: [], color: teamColours[teamB]});
	    			teamCounter++;
	    		}

	    		if(parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])){
					dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 1]);
					dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0]);
	    		} else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])){
					dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0]);
					dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 1]);
	    		} else {//DRAW
					dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0.5]);
					dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), 0.5]);
	    		}
	    	}
			
		
    	}
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
 	$('#graphs').highcharts().setTitle({text: "Match History: "+CompareA+" vs "+CompareB});
      $('#graphs').highcharts().yAxis[0].setExtremes();
    $('#graphs').highcharts().redraw();
}
function plotWinsIncremental(){
   var teamArray = {};
       //Clean out the data in the graph
   //cleanRemoveAllSeries();
   var dataArray = [];
   var teamCounter = 0;
		//Get Initial Totals
	var teamRunningTotalA = 0;
	var teamRunningTotalB = 0;
    for(i = 0; i < score_by_games.length;i++){
    	for(x = 0; x<score_by_games[i].length; x++){ 
    		
    		var teamA = score_by_games[i][x]["Team A"];
    		var teamB = score_by_games[i][x]["Team B"];
    		if(teamArray[teamA] == undefined){
    			teamArray[teamA] = teamCounter;
    			dataArray.push({name: teamA, data: [], color: teamColours[teamA]})
    			teamCounter++;
    		}  

    		if(teamArray[teamB] == undefined){
    			teamArray[teamB] = teamCounter;
    			dataArray.push({name: teamB, data: [], color: teamColours[teamB]})
    			teamCounter++;
    		}

    		if (dataArray[teamArray[teamA]].data.length > 0){
				teamRunningTotalA = dataArray[teamArray[teamA]].data[dataArray[teamArray[teamA]].data.length-1][1];			
			} 
			if (dataArray[teamArray[teamB]].data.length > 0){
				teamRunningTotalB = dataArray[teamArray[teamB]].data[dataArray[teamArray[teamB]].data.length-1][1];
			} 

    		if(parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])){
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamRunningTotalA+1]);
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamRunningTotalB]);
    		} else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])){
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamRunningTotalB+1]);
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamRunningTotalA]);
    		} else {//DRAW
				dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamRunningTotalA+0.5]);
				dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date']+' UTC',"yyyy/MM/dd HH:mm:ss"), teamRunningTotalB+0.5]);
    		}
			
		
    	}
    }

    cleanRemoveAllSeries();
    for(i = 0; i < dataArray.length; i++){
        $('#graphs').highcharts().addSeries(dataArray[i]);

    }
    $('#graphs').highcharts().setTitle({text: "LeaderBoard by Week"});
    $('#graphs').highcharts().yAxis[0].setExtremes(0);
	  $('#graphs').highcharts().redraw();
}