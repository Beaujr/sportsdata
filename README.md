SPORTDATA
==============

Generating meaningful graphs based on Social Sports results
--------------

This is a Angular, BootStrap, HighCharts, Chart.js, PHP Project.
I have created a scraping class for app.sportdata.com. If you wish to use this just create a PHP Class 
which will load a JSON file containing data in the structure of

{
	"Score":[
	   	{"Round":"1","Date":"21 April 2014","length":3,
	   		"0":{"Team A":"XXXXXXX","Team B":"YYYYYYY","A":"49","B":"37","F":""}
	   	{"Round":"2","Date":"28 April 2014","length":3,
	   		"0":{"Team A":"YYYYYYY","Team B":"XXXXXXX","A":"25","B":"47","F":""}
	   	],
   	"Teams":["YYYYYYY","XXXXXXX"]
}