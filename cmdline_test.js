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
var mcp = require("minecraft-ping");
var minecraftStatus = require("minecraft-server-status");

if (process.argv[2] === "list") {
  console.log("Querying " + process.argv[3] + ":" + process.argv[4]);
  var parameters = { host: process.argv[3], port: process.argv[4] };
  minecraftStatus(parameters.host, parameters.port, (response) => {
    let playerList = "no players";
    if (
      response.players.sample === undefined ||
      response.players.sample.length == 0
    ) {
      playerList = "No Players online";
      console.log(playerList);
    } else {
      playerList = response.players.sample;
      
      playerList.map(function (player) {
        return  playerList = player.name ;
      });
      console.log(playerList);
    }
  });
} else if (process.argv[2] === "number") {
  console.log("MSPinging " + process.argv[3] + ":" + process.argv[4]);
  mcp.ping_fe01(
    {
      host: process.argv[3],
      port: process.argv[4],
    },
    function (err, response) {
      console.log("Results:");
      console.log("   Error = " + JSON.stringify(err, null, 2));
      console.log("   Data  = " + JSON.stringify(response, null, 2));
    }
  );
}
