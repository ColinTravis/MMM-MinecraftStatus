/*
 * Helper script to lend a hand diagnosing problems with a Minecraft
 * server.  Call this from the command-line with a host and port.
 * This connects once, sends a single Minecraft-Ping, and displays
 * the raw results to the console.
 *
 * Sample invocation:
 *      % node cmdline_test.js  myhost.ddns.net 11847
 *      Results:
 *         Error = null
 *         Data  = {
 *             pingVersion: 1,
 *             protocolVersion: 127,
 *             gameVersion: '1.12.1',
 *             motd: 'Willowlands',
 *             playersOnline: 6,
 *             maxPlayers: 10
 *         }
 */
var axios = require("axios");

console.log("Querying " + process.argv[2] + ":" + process.argv[3]);
var parameters = { host: process.argv[2], port: process.argv[3] };
axios
  .get(`https://api.mcsrvstat.us/2/${parameters.host}:${parameters.port}`)
  .then(function (response) {
    let playerList = "no players";
    if (typeof response.data.players.list === "undefined") {
      playerList = "No Players online";
    } else (playerList = response.data.players.list)
    console.log(playerList);
  });

//    var timeSec = new Date() - startTime;
//    var playerCount = resp.numPlayers
//      ? resp.numPlayers
//      : resp.playersOnline;
//    helper.sendSocketNotification("MINECRAFT_UPDATE", {
//      identifier: payload.identifier,
//      players: playerCount,
//      latency: timeSec,
//    });

var mcp = require("minecraft-ping");

// console.log("MSPinging " + process.argv[2] + ":" + process.argv[3]);
// mcp.ping_fe01({
//     host: process.argv[2],
//     port: process.argv[3]
// },
// function(err, response) {
//     console.log("Results:");
//     console.log("   Error = " + JSON.stringify(err, null, 2));
//     console.log("   Data  = " + JSON.stringify(response, null, 2));
// });
