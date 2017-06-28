# Chest Finder

Live Site: [Chest Finder](http://chestfinder.me)

Created for Riot Games API Challenge 2016. We are two students from The University of Waterloo who are passionate about League of Legends. 

We were overjoyed when we heard that Riot was announcing a chest system. Ever since, we have played a lot more games hoping to get that key fragment. The only thing that we found difficult, was that when choosing champions in champion select, there was no indicator of which champions we have or have not received a chest for. 

We created a web application that solves this.

Chest Finder recommends champions that you can get a chest in based on your mastery points and highest grade. You can also see what chests you have already claimed and who you claimed them with.

# Technical Overview
The purpose of our app is to provide recommended champions with the highest probability of getting a chest in, as well as display all the champions that have already received a chest in.

To determine the recommended champions for the player, we looked at the player's past performance on different champions. Based on the highest grade (S+ to D-) and the mastery points the player had for the champion we could estimate how well the player plays a specific champion. This information is used to predict the top six champions for a player to attempt to get a chest on.

The app is built on **Node.js**. We chose Node.js because it does not take a lot of code to get started. We also liked the appeal of using one language for the entire application. We did not need any databases as all data is processed from queries to Riot's API. 

We used **Express** because it is a minimal and flexible Node.js web application framework that allows us to program the server side. Express serves request and handles the champion mastery data analysis.

The main webpage is built using HTML, JavaScript and CSS. The jQuery library was used for transitions and server queries.

We stored static data in JSON files. We saved the data in JSON files because Node.js has built in support for JSON.

`app.js` contains the express code for the server.  

`public/index.html` is the front facing webpage.

Chest Finder is dynamic to various screen sizes. It works even on mobile devices. The resolutions that we tested on are:

* 2560 x 1440
* 1920 x 1080
* 1280 x 720
* 800 x 600
* 320 x 480

## Backend
### Endpoints
`GET` requests to root `/` will serve the main webpage.

`POST` requests to `/info/region/summoner_name/role` gives a JSON response containing the recommended champions for the player. Detailed response information is outlined below under `displayData`.


### Static JSON Files
`champion_roles.json` Declares all the champions by role. 

`regions.json` Declares the regions.

### app.js 

`getSummonerId` Gets the *summoner_id* based on the *summoner name* by calling **Riot's summoner API.**

`getChampionMastery` Gets the **champion mastery** score and grade based on the *summoner_id* by calling **Riot's champion mastery API.** 

`addChampionInfo` Gets all the champions that exist in the game from [Riot's Static Api.](https://developer.riotgames.com/docs/static-data) and integrates it with the user's **champion mastery** information.

`filterChampions` Parses the user's **champion mastery** information to identify champions that they have preformed well on but have not recieved a chest for yet this season. Factors for recommending a champion are the highest rank they have recieved on the champion, and the amount of mastery points they have on the champion. This is further narrowed down by role. It also identifies champions that they have received a chest in.

`displayData` Responds to calls with the assembled json file. A sample JSON file call that would be constructed will look like this.
    
    summoner_name:                      string
    summoner_id:                        int
    has_chest:                          champion_info[]
    recommended:                        champion_info[]

Where

   	champion_info:
		name: 				string
		title: 				string
		key: 				string
		highest_grade: 			string
		champion_points: 		int
		image: 				imageDTO
    

# Frontend
We used HTML, JavaScript and CSS for the front end. We grabbed the splash images and champion icon images from [Riot Static Data API](https://developer.riotgames.com/docs/static-data).
### script.js

`loadPlayer` Grabs summoner id, role, and region from the form, sends it to our server, and gets recommended champions and champions that have already received a chest back.

`displaySplash` Grabs the splash image of the recommended champion from Riot's Static Api and displays it to the screen.

`displayChamps` Grabs the champion icon from Riot's Static Api and displays a list of other recommended champions as well as champions that have already received a chest.

# Production

We published our web application on Heroku at [Chest Finder.](http://chestfinder.me) We chose Heroku because it is free and easy to deploy to. Heroku also makes it easy to scale up the application at a later date.

# Installation 

## Prerequisite
Get an API key from the [Riot Games Developer](https://developer.riotgames.com) site.

Download and Install [Node.js](https://nodejs.org/en/).

## Configuration
Install dependencies

    npm install
### Environment Variables
Navigate to `sample.env` and rename it to `.env`.

Open the `.env` file and define the following.

Define `RIOT_API_KEY` to be your Riot API key.

Define `PORT` to be the port the server should run at.

## Build
Build the server
    
    node start
  	
You will be able to see the completed project at localhost:PORT.

# Challenges
It was difficult for us to layout and display all the information in a user intuitive way using CSS. We were able to layout everything accordingly. The end result is a polished product that we are extremely proud of.

This was our first project where we used Node.js and it was an excellent learning experience. We found that it was very easy to get an app running quickly. 

# Disclaimer
Chest Finder isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
