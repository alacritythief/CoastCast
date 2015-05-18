CoastCast v1.0
==============

A realtime WvW reporting system for Tarnished Coast, using Node.JS and Express.JS

Server Instructions:
-------------------

* Make sure [Node.js](https://nodejs.org/) and NPM are installed
* Clone this repo and go into its folder
* `npm install` will locally install all required Node modules
* A `.env` file is needed with a `SECRET_KEY` value, this can be anything for testing purposes.
* `node server.js` to run the server
* Go to [localhost:3000](http://localhost:3000/) in your browser

POST Testing:
-------------

* Run the server `node server.js`
* In another terminal window, enter:
* `curl -d '{"user": "Jim Bob", "report": "30 BG at spawn tower"}' -H "Content-Type: application/json" http://127.0.0.1:3000/ping`
* Check your server's terminal window to see if the POST was received.

PING Testing:
-------------

* Opening [localhost:3000/ping](http://localhost:3000/ping) makes sure the server is running and receiving GET requests.
* Sending a POST request to [localhost:3000/ping](http://localhost:3000/ping) makes sure the server is receiving POST requests.
