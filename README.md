forkjs
======

ForkJS is a simple framework which basically lets you easily manage nodeJS processes by forking. Forking is best used for running parallel processes. In NodeJS, forking is also beneficial to fully utilize all the available cores in the system.

To test
----

1. Run server.js on one terminal
	
		node server.js
		
2. Run tests on another terminal
		
		node tests/simple.js
		node tests/multiple.js
		node tests/dynamic.js



server.js
------------

server.js will fork processes. This will be the point-of-entry of all fork request. This has control mechanisms which will be helpful to manage the forked process.

Each forked process can represent an app. 

server.js runs an Express HTTP server where it will be accepting commands from Front-end apps.


----

Available commands for server.js:
1. Create
	- This will create an instance of the target nodejs app which accepts a single parameter
	- For this usage, single parameter is sufficient for the nodejs script to run on it's own
	- An app could be connected to database backends, and the parameter could just be an ID of an object
	- Each instance will have it's own ID which comes from the request


2. Run- This will trigger a run command for the instance
3. Stop - This will trigger a stop command for the instance
4. Resume - This will trigger a stop command for the instance
5. Kill - This will trigger a kill command for the instance