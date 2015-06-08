CoastCast v1.0
==============

A realtime WvW reporting system for Tarnished Coast, using Node.JS, Express.JS, and Socket.io.

Server Instructions:
-------------------

* Make sure [Node.js](https://nodejs.org/) and NPM are installed
* Clone this repo and go into its folder
* `npm install` will locally install all required Node modules
* A `.env` file is needed with a `SECRET_KEY` value, this can be anything for testing purposes.
* `node server.js` to run the server
* Go to [localhost:3000](http://localhost:3000/) in your browser

Using the CoastCast API:
------------------------

Each JSON route is at `bgcolor/json`. Each will send back the latest 100 reports. Available routes:
* `http://localhost:3000/red/json`
* `http://localhost:3000/green/json`
* `http://localhost:3000/blue/json`
* `http://localhost:3000/ebg/json`

For submitting a report to the CoastCast API, POST to `http://localhost:3000/submit` with a valid GW2 API key.
* Example: `curl -d '{"user": "Sneaky Scout", "report": "30 JQ at spawn tower", "apikey": "xxxyyzz"}' -H "Content-Type: application/json" http://127.0.0.1:3000/submit`
* If all information is valid, and the API key verified to be on TC, a 200 response will be sent back with the creation of the report.
* Otherwise, you will get a 500 response back with errors such as `Bad API Key`, `NOT ON TC`, or `Incomplete Report`, depending on what has been sent.


POST Testing:
-------------

* Uncomment PING area in `server.js`
* Run the server `node server.js`
* In another terminal window, enter:
* `curl -d '{"user": "Jim Bob", "report": "30 BG at spawn tower", "apikey": "xxxyyzz"}' -H "Content-Type: application/json" http://127.0.0.1:3000/ping`
* Check your server's terminal window to see if the POST was received.

PING Testing:
-------------

* Uncomment PING area in `server.js`
* Opening [localhost:3000/ping](http://localhost:3000/ping) makes sure the server is running and receiving GET requests.
* Sending a POST request to [localhost:3000/ping](http://localhost:3000/ping) makes sure the server is receiving POST requests.
