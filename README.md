# Chest Finder

Live Site: [Chest Finder](https://ancient-falls-66352.herokuapp.com/)

Created for Riot Games API Challenge 2016. We are two students from The University of Waterloo who are passionate about League of Legends. 

We were overjoyed when we heard that Riot was announcing a chest system. Ever since, we have played a lot more games hoping to get that key fragment. The only thing that we found difficult, was that there was no indicator in champion select of which champions we have or have not received a chest for. 

We created a web application that solves this.

Chest Finder recommends champions that you can get a chest in based on your mastery points and highest grade. You can also see what chests you have already claimed and who you claimed them with.

# Technical Overview
The purpose of our app is to provide recommended champions with the highest probability of getting a chest in, as well as display all the champions that have already received a chest in.

The app is built on **Node Js**. We chose Node Js because it does not take a lot of code to get started. We did not need any databases so we chose not to use Ruby on Rails. 

We used **Express** because is a minimal and flexible Node.js web application framework that allows us to program the server side.

We stored static data in JSON files. We saved the data in JSON files because Node Js has built in support for JSON.

`app.js` contains the express code for our back end server.  

`script.js` contains our javascript code for our front end.

## Project Architecture
### Static JSON Files
`champion_roles.json` We identified the positions of all the champions and saved it in a json. 

`package.json`

### app.js 

`getSummonerId` Gets the *summoner_id* based on the *summoner name* by calling Riot's summoner API.

`getChampionMastery` Gets the **champion mastery** score and grade based on the summoner Id by calling Riot's champion mastery API. 

`addChampionInfo` Gets all the champions that exist in the game from Riot's static Api.

`filterChampions` Parses the user's **champion mastery** information to identify champions that they have preformed well on but have not recieved a chest for yet this season. Factors for recommending a champion are the highest rank they have recieved on the champion, and the amount of mastery points they have on the champion. This is further narrowed down by role. It also identifies champions that they have received a chest in.

`displayData` Responds to calls with the assembled json file. A sample JSON file call that would be constructed will look like this.

	champion_info:
		name: 				string
		title: 				string
		key: 				string
		highest_grade: 		string
		champion_points: 	int
		image: 				imageDTO
    
    summoner_name: 			string
    summoner_id: 			int
    has_chest: 				champion_info[]
    recommended: 			champion_info[]
    
### script.js

`loadPlayer` Grabs summoner id, role, and region from the form, sends it to our server, and gets recommended champions and champions that have already received a chest back.

`displaySplash` Grabs the splash image of the recommended champion from Riot's Static Api and displays it to the screen.

`displayChamps` Grabs the champion icon from Riot's Static Api and displays a list of other recommended champions as well as champions that have already received a chest.

# Frontend
We used pure HTML and CSS for the front end.
We grabbed the splash images and champion icon images from [Riot's Static Api.](https://developer.riotgames.com/docs/static-data) 

# Production

We published our web application on Heroku at [Chest Finder.](https://ancient-falls-66352.herokuapp.com/)

# Installation 

## Prerequisite
Get an API key from the [Riot Games Developer](https://developer.riotgames.com) site.


## Configuration
Define the `RIOT_API_KEY` environment variable to be your Riot API key.


## Build
To build the server, run
    
    node start
  	
#Challenges
