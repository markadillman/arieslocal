var tileWidth = 600;
var tileHeight = 350;
var canvasEdge = 50;
var screenWidth = tileWidth + (2 * canvasEdge);
var screenHeight = tileHeight + (2 * canvasEdge);
var currentCenterX = 0;
var currentCenterY = 0;
var spriteWidth = 10;
var spriteHeight = 50;
var defaultTextColor = '#373854'

//BEGIN CODE ADDED BY MARK

//global value holder for socket.io socket and socketId
var socket;
var socketId;
var playerGlob;
//global constant to determine number of logical frames per network frame
const netFrameRate = 25;
var playerPositionMap = {};
//END CODE ADDED BY MARK


function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

Game =
{
	start: function()
	{
		//BEGIN CODE ADDED BY MARK
		//create socket.io connection DIFFERENT ON LOCAL AND SERVER. ADJUST.
		var socket = io('http://192.168.2.50:8080');
		socket.on('assign id', function(data){
			socketId = data.id;
		});
		//END CODE ADDED BY MARK

		Crafty.init(screenWidth, screenHeight, document.getElementById('game'));

		Crafty.background('#e0fbfd')

		// Start screen scene
		Crafty.defineScene('HomeScreen', function()
		{
			// Title
			Crafty.e('2D, DOM, Text')
				.attr({x: 0, y: screenHeight / 3,
					   w: screenWidth, h: screenHeight})
				.text('&lt;TITLE&gt;')
				.textFont({family: 'Trebuchet MS',
						   size: '50px',
						   weight: 'bold'})
				.textColor(defaultTextColor)
				.textAlign('center');

			// Instructions
			Crafty.e('2D, DOM, Text')
				.attr({x: 0, y: (screenHeight / 3) * 2,
					   w: screenWidth, h: screenHeight})
				.text('Press Enter to begin')
				.textFont({family: 'Trebuchet MS',
						   size: '30px',
						   weight: 'bold'})
				.textColor(defaultTextColor)
				.textAlign('center');

			// Enter key loads avatar selection screen
			Crafty.e('Start, 2D, Canvas, Color, Solid')
				.attr({x: 200, y: 200, w: 100, h: 40})
				.bind('KeyDown', function(e)
				{
					if(e.key == Crafty.keys.ENTER)
					{
						Crafty.enterScene('SetupScreen');
					}
				});
		});

		// Player setup screen scene
		Crafty.defineScene('SetupScreen', function()
		{
			// Select avatar
			// Left arrow
			Crafty.e('2D, DOM, Color, Mouse')
				.attr({x: screenWidth / 6, y: screenHeight / 3, w: 40, h: 40})
				.color('red');

			// Right arrow
			Crafty.e('2D, DOM, Color, Mouse')
				.attr({x: (screenWidth / 6) * 5 - 40, y: screenHeight / 3,
					   w: 40, h: 40})
				.color('red');

			//retreive stock avatars

			// Selected avatar

			// Ready/enter world button
			Crafty.e('2D, DOM, Color, Mouse, Text')
				.attr({x: (screenWidth / 2) - 100,
					   y: screenHeight - (canvasEdge * 2),
					   w: 200, h: 40})
				.color('#FFFFFF')
				.text('Start!')
				.textAlign('center')
				.textFont({family: 'Trebuchet MS',
						   size: '20px'})
				.bind('Click', function(MouseEvent)
				{
					Crafty.enterScene('World');
				});
		});

		// Main game world scene
		Crafty.defineScene('World', function()
		{
			//helper function that sets up the data structure for other player locs in memory
			function _initPlayerStruct(){

			}
			//helper function. Argument takes {x,y,id} object.
			function _updatePlayerStruct(){

			}
			// Player sprite
	        var player = Crafty.e('2D, DOM, Color, Twoway, Gravity')
	        	// Initial position and size
	      		.attr({x: 0, y: 0, w: 10, h: 50})
	      		// Color of sprite (to be replaced)
	      		.color('#F00')
	      		// Enable 2D movement
	      		.twoway(200)
	      		// Set platforms to stop falling player
	      		.gravity('Platform')
	      		.gravityConst(600)
	      		// Bind spacebar to jump action
	      		.jumper(300, [Crafty.keys.SPACE])
	      		// Allow player to drop through platforms
	      		.bind('KeyDown', function(e)
	      		{
	      			if(e.key == Crafty.keys.DOWN_ARROW)
	      			{
	      				this.antigravity();
	      				this.gravity('Platform');
	      			}})
	      		.bind('KeyUp', function(e)
	      		{
	      			if(e.key == Crafty.keys.DOWN_ARROW)
	      			{
	      				this.gravity('Platform');
	      			}})
	      		//BEGIN CODE ADDED BY MARK
	      		//this event will be triggered once the player is in the world.
	      		.bind('SceneLoaded',function(eventData){
					//function to handle the initial admission to the player pool
					if (!(eventData === null)){
						console.log(eventData);
						socket.emit('init position',{x : eventData.x , y : eventData.y});
					}
	      		})
	      		.bind('NewPlayer',function(eventData){

	      			if (!(eventData.id === socketId)){
	      				//this function will either create a different colored rectangle or, in the future,
	      				//load the player's avatar into memory and start rendering it over their hitbox
	      				var otherPlayer = Crafty.e('2D, DOM, Color, Twoway, Gravity')
	      					// Initial position and size
	      					.attr({x: eventData.x, y: eventData.y, w: 10, h: 50})
	      					// Color of sprite (to be replaced)
	      					.color('#F41')
	      					.twoway(200)
	      					// Set platforms to stop falling other player
	      					.gravity('Platform')
	      					.gravityConst(600);
	      				//add a field that ties this player to an id
	      				otherPlayer.friendId = eventData.id;
	      				//set the Crafty id as a field
	      				otherPlayer.craftyId = otherPlayer.getId();
	      				//add this to player position map
	      				playerPositionMap[otherPlayer.friendId] = otherPlayer;
	      				console.log("OTHER PLAYER");
	      				console.log(otherPlayer);
	      				console.log("MAP ON NEW LOGIN.");
	      				console.log(playerPositionMap);
	      			}
	      			else {
	      				console.log("id's equal");
	      			}
	      		})
				//this removes a recently logged off player from the position map
	      		.bind('OtherPlayerLogoff',function(eventData){
	      			delete playerPositionMap[eventData.id];
	      			console.log("Player position map post logoff");
	      			console.log(playerPositionMap);
	      		})
	      		//update the position map with new data. Event data is complete wherabouts of active players keyed by id
	      		.bind('UpdateMap',function(eventData){
	      			console.log("event data");
	      			console.log(eventData);
	      			//for each player, update position if entity exists
	      			for (key in eventData){
	      				console.log("player position map");
	      				console.log(playerPositionMap);
	      				//if the ID is in the current map and in the data for the update, update the coords
	      				if (!(playerPositionMap[key] === undefined || key === socketId)){
	      					console.log(playerPositionMap[key]);
	      					//look up crafty entity for this player
	      					var targetPlayer = Crafty(playerPositionMap[key]['craftyId']);
	      					targetPlayer.x = eventData[key]['x'];
	      					targetPlayer.y = eventData[key]['y'];
	      					console.log(playerPositionMap);	 				
	      				}
	      				//if player is pre-existing player that does not have an avatar, make one
	      				if (playerPositionMap[key] === undefined && !(playerPositionMap[key] === socketId)){
	      					//this function will either create a different colored rectangle or, in the future,
	      					//load the player's avatar into memory and start rendering it over their hitbox
	      					var otherPlayer = Crafty.e('2D, DOM, Color, Twoway, Gravity')
	      						// Initial position and size
	      						.attr({x: eventData[key]['x'], y: eventData[key]['y'], w: 10, h: 50})
	      						// Color of sprite (to be replaced)
	      						.color('#F41')
	      						.twoway(200)
	      						// Set platforms to stop falling other player
	      						.gravity('Platform')
	      						.gravityConst(600);
	      					//add a field that ties this player to an id
	      					otherPlayer.friendId = eventData.id;
	      					//set the Crafty id as a field
	      					otherPlayer.craftyId = otherPlayer.getId();
	      					//add this to player position map
	      					playerPositionMap[otherPlayer.friendId] = otherPlayer;
	      				}
	      			}
	      		})
	      		//update with new coordinates every second (50 fps)
	      		.bind("EnterFrame",function(eventData){
	      			if (eventData.frame % netFrameRate === 0){
	      				//DEBUG
	      				//console.clear();
	      				console.log("x: " + this.x.toString() + " y : " + this.y.toString() + " id: " + socketId);
	      				//END DEBUG
	      				socket.emit('changeCoords', {x : this.x , y : this.y , id : socketId});
	      				socket.emit('position request');
	      			}
	      		});

	      	playerGlob = player;
	      	//END CODE ADDED BY MARK

	      	// Platforms
	      	Crafty.e('Platform, 2D, Canvas, Color')
	      		.attr({x: 0, y: 250, w: 250, h: 10})
	      		.color('green');

	      	Crafty.e('Platform, 2D, Canvas, Color')
	      		.attr({x: 400, y: 300, w: 250, h: 10})
	      		.color('green');

	      	Crafty.e('Platform, 2D, Canvas, Color')
	      		.attr({x: 130, y: 450, w: 100, h: 10})
	      		.color('green');

	      	Crafty.e('Platform, 2D, Canvas, Color')
	      		.attr({x: 170, y: 540, w: 100, h: 10})
	      		.color('green');

	      	// Floor
	      	Crafty.e('Platform, 2D, Canvas, Color')
	      		.attr({x: -4000, y: 590, w: 8000, h: 10})
	      		.color('green');

	       	// Have camera follow player sprite
	       	Crafty.viewport.follow(player, 0, 50);

	       	//BEGIN CODE ADDED BY MARK

	       	//trigger the player creation event
	       	player.trigger('SceneLoaded',{x:player.x,y:player.y,id:socketId});
	       	//this will trigger the player to call the function that adds to list of known players
	       	socket.on('new player',function(data){
	       		//actual event trigger
	       		player.trigger('NewPlayer',data);
	       	});
	       	//this will trigger when server responds with updated positions
	       	socket.on('position response',function(data){
	       		console.log("positions");
	       		console.log(data);
	       		//actual event trigger
	       		player.trigger('UpdateMap',data);
	       	});
	       	//this will trigger when a player logs off
	       	socket.on('player logoff',function(data){
	       		//actual event trigger
	       		player.trigger('OtherPlayerLogoff',data);
	       	});
	       	//END CODE ADDED BY MARK
      	});

		// Start game on home screen
      	Crafty.enterScene('HomeScreen');
	}
}