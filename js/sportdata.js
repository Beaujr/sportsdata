//If your team is blank, you are the jimmy rustlers!
//TODO: set to first team in the division
var myTeam;
var id;
var geocoder;
var map;
var teamColours = [];
var donutArray = [];
function setColours() {
    for (i = 0; i < teams.length; i++) {
        teamColours[teams[i]] = Highcharts.getOptions().colors[i];

    }
}
function init(id, source) {
    this.id = id;
    source = (source == null) ? $('div[class=btn-group]').find('label[class*=active]').text() : source;
    $.getJSON("PHP/API.php?service=score&id=" + id+"&source="+source, function (data) {
        score_by_games = data['Score'];
        teams = data['Teams'];
        if(myTeam != undefined){
            setTeam(myTeam);
        }
    });
}
function setTeam(team) {
    myTeam = team;
    if (score_by_games.length == 0) {
        $('#fastAnalysis').find('h2').text('NO DATA NO GAMES PLAYED');
    } else {
        $('#fastAnalysis').find('h2').text(myTeam);
    }

        setColours();
        plotWinsIncremental();
        generateDonuts();


}
function generateDonuts() {
    var options = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,
        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",
        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,
        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout: 50, // This is 0 for Pie charts
        //Number - Amount of animation steps
        animationSteps: 100,
        //String - Animation easing effect
        animationEasing: "easeOutBounce",
        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: true,
        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,
        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };
    if (donutArray.length == 0) {
        donutArray.push({object: chartFactory("lastMatch", options, "lastMatchDonut", "doughnut"), update: 'lastMatchDonut' });
        donutArray.push({object: chartFactory("winsvLosses", options, "winsvLossesDonut", "doughnut"), update: 'winsvLossesDonut' });
        donutArray.push({object: chartFactory("forAgainst", options, "forAgainstDonut", "doughnut"), update: 'forAgainstDonut' });
        donutArray.push({object: chartFactory("winsLadder", options, "winsLadderPolar", "polar"), update: 'winsLadderPolar' });
    } else {
        for(var i = 0; i < donutArray.length; i++){
            var updata = window[donutArray[i].update]();
            donutArray[i].object.segments = [];
            for (var x = 0; x < updata.length; x++){
                donutArray[i].object.addData(updata[x], x);
            }
            donutArray[i].object.update();

        }
    }

}

function chartFactory(div, options, data, type) {
    var ctx = document.getElementById(div).getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    data = window[data]();
    if (type == 'doughnut') {
        return new Chart(ctx).Doughnut(data, options);
    }
    if (type == 'polar') {
        return new Chart(ctx).PolarArea(data, options);
    }
    return false;
}

function lastMatchDonut() {
    var data = [];
    //For all the games played so far
    for (i = score_by_games.length - 1; i >= 0; i--) {
        //For all the data in the match
        if (data.length != 0) {
            break;
        }
        for (x = score_by_games[i].length - 1; x >= 0; x--) {
            //Team A
            var teamA = score_by_games[i][x]["Team A"];
            //TEAM B
            var teamB = score_by_games[i][x]["Team B"];
            if (parseInt(score_by_games[i][x]["B"]) == 0 && parseInt(score_by_games[i][x]["A"]) ==0){
                data = [
                    {
                        value: 0.5,
                        color: "#00B2EE",
                        highlight: "#B2DFEE",
                        label: 'Draw @ Nil'
                    }];
                var opponent = (myTeam == teamA) ? teamB :  teamA;
                $('#lastMatch').parent().parent().find('p').text('Against: ' + opponent);
                break;
            }

            if (teamA == myTeam) {
                data = [
                    {
                        value: parseInt(score_by_games[i][x]["B"]),
                        color: "#F7464A",
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
                $('#lastMatch').parent().parent().find('p').text('Against: ' + teamB);
                break;
            } else if (teamB == myTeam) {
                data = [
                    {
                        value: parseInt(score_by_games[i][x]["A"]),
                        color: "#F7464A",
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
                $('#lastMatch').parent().parent().find('p').text('Against: ' + teamA);
                break;
            }
        }
    }
    return data;
}
//forAgainst
function winsvLossesDonut() {
    var wins = 0;
    var losses = 0;
    var draw = 0;
    //For all the games played so far
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];

            if (teamA == myTeam || teamB == myTeam) {
                if (parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])) {
                    wins = (teamA == myTeam) ? wins + 1 : wins;
                    losses = (teamB == myTeam) ? losses + 1 : losses;
                } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])) {
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
            color: "#F7464A",
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
function forAgainstDonut() {
    var scored = 0;
    var missed = 0;
    //For all the games played so far
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];
            if (score_by_games[i][x]["F"] != ""){

            } else if (teamA == myTeam) {
                scored += parseInt(score_by_games[i][x]["A"]);
                missed += parseInt(score_by_games[i][x]["B"])
            } else if (teamB == myTeam) {
                scored += parseInt(score_by_games[i][x]["B"]);
                missed += parseInt(score_by_games[i][x]["A"])
            }


        }
    }
    var data = [
        {
            value: missed,
            color: "#F7464A",
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

function winsLadderPolar() {

    var teamArray = [];
    //For all the games played so far
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];
            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = 0;
            }
            //ADD Team B to the Team Array
            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = 0;
            }
            if (score_by_games[i][x]["F"] != ""){
                var forfeit = score_by_games[i][x]["F"];
                var forfeitTeam = score_by_games[i][x]["Team "+forfeit];
                var yourScore = (teamA == forfeitTeam) ? teamArray[teamB]++: teamArray[teamA]++;
            } else if (parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])) {
                teamArray[teamA]++;
            } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])) {
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
//Empty the graphs
function cleanRemoveAllSeries() {
    while ($('#graphs').highcharts().series.length > 0)
        $('#graphs').highcharts().series[0].remove(true);

}
/**
 * Plots a running total week by week of the goals scored by the team
 *
 */

function plotGoalsIncrement() {
    var teamArray = {};
    var dataArray = [];
    var teamCounter = 0;
    //For all the games played so far
    for (i = 0; i < score_by_games.length; i++) {
        //For all the data in the match
        for (x = 0; x < score_by_games[i].length; x++) {
            //Team A
            var teamA = score_by_games[i][x]["Team A"];
            //TEAM B
            var teamB = score_by_games[i][x]["Team B"];
            //Add Team A to the Team Array
            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], visible: (myTeam == teamA) ? true : false, color: teamColours[teamA]})
                teamCounter++;
            }
            //ADD Team B to the Team Array
            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = teamCounter;
                dataArray.push({name: teamB, data: [], visible: (myTeam == teamB) ? true : false, color: teamColours[teamB]})
                teamCounter++;
            }
            //If the team already has a goal recorded 
            if (dataArray[teamArray[teamA]].data.length > 0) {
                //Get the total from the last game
                var teamRunningTotal = dataArray[teamArray[teamA]].data[dataArray[teamArray[teamA]].data.length - 1][1];
                //Add it to this matchs score
                teamRunningTotal += parseInt(score_by_games[i][x]["A"]);
                //Store the new total for this week
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), parseInt(teamRunningTotal)]);
            } else {
                //We are at Game 1 so store the Teams goal score
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["A"])]);
            }
            //SAME as above for Team B instead of team A
            if (dataArray[teamArray[teamB]].data.length > 0) {
                var teamRunningTotal = dataArray[teamArray[teamB]].data[dataArray[teamArray[teamB]].data.length - 1][1];
                teamRunningTotal += parseInt(score_by_games[i][x]["B"]);
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), parseInt(teamRunningTotal)]);
            } else {
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["B"])]);
            }

        }
    }

    //Clean out the data in the graph
    cleanRemoveAllSeries();
    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    //Set the graphs Title
    $('#graphs').highcharts().setTitle({text: "Running total of Goals Scored By Week"});
    //Redraw the graph with the new data
    $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}
function plotGoalsPerWeek() {
    var teamArray = {};
    var dataArray = [];
    var teamCounter = 0;
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];
            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], visible: (myTeam == teamA) ? true : false, color: teamColours[teamA]})
                teamCounter++;
            }

            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = teamCounter;
                dataArray.push({name: teamB, data: [], visible: (myTeam == teamB) ? true : false, color: teamColours[teamB]})
                teamCounter++;
            }

            dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["A"])]);
            dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), parseInt(score_by_games[i][x]["B"])]);


        }
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Goals Scored Each Game"});
    $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}

function plotWinLossMargins() {
    var teamArray = {};
    var dataArray = [];
    var teamCounter = 0;
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];
            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], visible: (myTeam == teamA) ? true : false, color: teamColours[teamA]})
                teamCounter++;
            }

            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = teamCounter;
                dataArray.push({name: teamB, data: [], visible: (myTeam == teamB) ? true : false, color: teamColours[teamB]})
                teamCounter++;
            }
            var teamAScore = parseInt(score_by_games[i][x]["A"]);
            var teamBScore = parseInt(score_by_games[i][x]["B"]);
            if (teamAScore > teamBScore) {
                teamAScore = teamAScore - teamBScore;
                teamBScore = teamAScore * -1;
            } else if (teamAScore < teamBScore) {
                teamBScore = teamBScore - teamAScore;
                teamAScore = teamBScore * -1;
            } else {
                teamAScore = 0;
                teamBScore = 0;
            }
            dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamAScore]);
            dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamBScore]);


        }
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Weekly Win / Loss Margin"});
    $('#graphs').highcharts().yAxis[0].setExtremes();
    $('#graphs').highcharts().redraw();
}

function plotGoalsMarginsIncremental() {
    var teamArray = {};
    var dataArray = [];
    var teamCounter = 0;

    var teamRunningTotalA = 0;
    var teamRunningTotalB = 0;

    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];

            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], visible: (myTeam == teamA) ? true : false, color: teamColours[teamA]})
                teamCounter++;
            }

            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = teamCounter;
                dataArray.push({name: teamB, data: [], visible: (myTeam == teamB) ? true : false, color: teamColours[teamB]})
                teamCounter++;
            }


            var teamAScore = parseInt(score_by_games[i][x]["A"]);
            var teamBScore = parseInt(score_by_games[i][x]["B"]);
            if (teamAScore > teamBScore) {
                teamAScore = teamAScore - teamBScore;
                teamBScore = teamAScore * -1;
            } else if (teamAScore < teamBScore) {
                teamBScore = teamBScore - teamAScore;
                teamAScore = teamBScore * -1;
            } else {
                teamAScore = 0;
                teamBScore = 0;
            }

            if (dataArray[teamArray[teamA]].data.length > 0) {
                teamRunningTotalA = dataArray[teamArray[teamA]].data[dataArray[teamArray[teamA]].data.length - 1][1];
            }
            if (dataArray[teamArray[teamB]].data.length > 0) {
                teamRunningTotalB = dataArray[teamArray[teamB]].data[dataArray[teamArray[teamB]].data.length - 1][1];
            }

            dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamAScore + teamRunningTotalA]);


            dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamBScore + teamRunningTotalB]);


        }
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Running Weekly Total of (Goals Scored - Goals Against)"});
    $('#graphs').highcharts().yAxis[0].setExtremes();
    $('#graphs').highcharts().redraw();
}

function plotWinsLosses() {
    //$('.nav a:contains("pWinsLossPw")').tab('show');
    var teamArray = {};
    var dataArray = [];
    var teamCounter = 0;
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];
            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], visible: (myTeam == teamA) ? true : false, color: teamColours[teamA]})
                teamCounter++;
            }

            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = teamCounter;
                dataArray.push({name: teamB, data: [], visible: (myTeam == teamB) ? true : false, color: teamColours[teamB]})
                teamCounter++;
            }
            if (parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])) {
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 1]);
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0]);
            } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])) {
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0]);
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 1]);
            } else {//DRAW
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0.5]);
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0.5]);
            }


        }
    }

    //return dataArray;
    cleanRemoveAllSeries();
    cleanRemoveAllSeries();
    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }


    $('#graphs').highcharts().setTitle({text: "Wins vs Losses per Week"});
    $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}
function plotCompareTwoTeams(CompareA, CompareB) {
    var teamArray = {};
    var dataArray = [];
    var teamCounter = 0;
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];

            if ((teamA == CompareA || teamA == CompareB) && (teamB == CompareA || teamB == CompareB)) {
                if (teamArray[teamA] == undefined) {
                    teamArray[teamA] = teamCounter;
                    dataArray.push({name: teamA, data: [], color: teamColours[teamA]});
                    teamCounter++;
                }

                if (teamArray[teamB] == undefined) {
                    teamArray[teamB] = teamCounter;
                    dataArray.push({name: teamB, data: [], color: teamColours[teamB]});
                    teamCounter++;
                }

                if (parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])) {
                    dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 1]);
                    dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0]);
                } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])) {
                    dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0]);
                    dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 1]);
                } else {//DRAW
                    dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0.5]);
                    dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), 0.5]);
                }
            }


        }
    }

    //return dataArray;
    cleanRemoveAllSeries();
    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);
    }
    $('#graphs').highcharts().setTitle({text: "Match History: " + CompareA + " vs " + CompareB});
    $('#graphs').highcharts().yAxis[0].setExtremes();
    $('#graphs').highcharts().redraw();
}
function plotWinsIncremental() {
    var teamArray = {};
    //Clean out the data in the graph
    //cleanRemoveAllSeries();
    var dataArray = [];
    var teamCounter = 0;
    //Get Initial Totals
    var teamRunningTotalA = 0;
    var teamRunningTotalB = 0;
    for (i = 0; i < score_by_games.length; i++) {
        for (x = 0; x < score_by_games[i].length; x++) {

            var teamA = score_by_games[i][x]["Team A"];
            var teamB = score_by_games[i][x]["Team B"];
            if (teamArray[teamA] == undefined) {
                teamArray[teamA] = teamCounter;
                dataArray.push({name: teamA, data: [], color: teamColours[teamA]})
                teamCounter++;
            }

            if (teamArray[teamB] == undefined) {
                teamArray[teamB] = teamCounter;
                dataArray.push({name: teamB, data: [], color: teamColours[teamB]})
                teamCounter++;
            }

            if (dataArray[teamArray[teamA]].data.length > 0) {
                teamRunningTotalA = dataArray[teamArray[teamA]].data[dataArray[teamArray[teamA]].data.length - 1][1];
            }
            if (dataArray[teamArray[teamB]].data.length > 0) {
                teamRunningTotalB = dataArray[teamArray[teamB]].data[dataArray[teamArray[teamB]].data.length - 1][1];
            }

            if (parseInt(score_by_games[i][x]["A"]) > parseInt(score_by_games[i][x]["B"])) {
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamRunningTotalA + 1]);
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamRunningTotalB]);
            } else if (parseInt(score_by_games[i][x]["A"]) < parseInt(score_by_games[i][x]["B"])) {
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamRunningTotalB + 1]);
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamRunningTotalA]);
            } else {//DRAW
                dataArray[teamArray[teamA]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamRunningTotalA + 0.5]);
                dataArray[teamArray[teamB]].data.push([Date.parse(score_by_games[i]['Date'] + ' UTC', "yyyy/MM/dd HH:mm:ss"), teamRunningTotalB + 0.5]);
            }


        }
    }

    cleanRemoveAllSeries();


    for (i = 0; i < dataArray.length; i++) {
        $('#graphs').highcharts().addSeries(dataArray[i]);

    }
    $('#graphs').highcharts().setTitle({text: "LeaderBoard by Week"});
    $('#graphs').highcharts().yAxis[0].setExtremes(0);
    $('#graphs').highcharts().redraw();
}
function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
function initializeMap() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
        zoom: 13,
        center: latlng,
        scaleControl: false,
        draggable: false,
        scrollwheel: false
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function codeAddress(location) {
    address = location.name;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var formatted_address = results[0].formatted_address.split(",");
            formatted_address.splice(0,1);
            formatted_address = formatted_address.join(",");
            if(address == "scratch bar, milton, QLD"){
                formatted_address = "Address Not Found, get maggot instead";
            }
            var contentString ='<div id="content">'+
                '<h4 id="firstHeading" class="firstHeading">'+address+'</h4>'+
                '<div id="bodyContent">'+
                '<p>'+formatted_address+'</p>'+
                '</div>'+
                '</div>';
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map,marker);
            });
            infowindow.open(map,marker);
        } else {
           //Can't Find address, fuck it lets get drunk
           codeAddress({name: "scratch bar, milton, QLD"});
        }
    });
}
