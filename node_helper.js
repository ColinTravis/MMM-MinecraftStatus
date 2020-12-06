/* global module, require */
/* jshint node: true, esversion: 6 */

/* Magic Mirror
 * Node Helper: MMM-MinecraftStatus
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var mp = require("minecraft-ping");
var axios = require("axios");

module.exports = NodeHelper.create({
  // Override start method.
  start: function () {
    console.log("[MinecraftStatus] Starting node helper");
  },

  /*
   * Callback function from MagicMirror invoked when one of the MinecraftStatus objects
   * in a browser anywhere call socketNotificationSend().  We consider this an async
   * request/response pair, so this pings the minecraft server given to us, then responds
   * with the result, either success or error.
   * HOWEVER, this isn't the model for MagicMirror!  Browser's sendSocketNotification()
   * and helper's socketNotificationReceived() is a Queue pattern where many senders
   * (each MinecraftStatus object in each browser) sends to a single consumer (this
   * helper).  The other side where the helper's sendSocketNotification() sends to the
   * browser's socketNotificationReceived() is a Message Bus pattern: every browser
   * object receives a copy of the message and each consumes it independently.  Because
   * of this, we include "payload.identifier" below, sent from the browser, so each
   * consumer can decide if this message was intended for it.  In practice, only one
   * browser object really consumes this message.
   *
   * This has the real call to Minecraft.  See https://www.npmjs.com/package/minecraft-ping
   */
  socketNotificationReceived: function (notification, payload) {
    // if (notification === "MINECRAFT_PING") {
    //   // console.log("[MinecraftStatus] MCPinging " + payload.hostname + ":" + payload.port);
    //   var arg = { host: payload.hostname, port: payload.port };
    //   var startTime = new Date();
    //   var helper = this;
    //   mp.ping_fe01(arg, function (err, resp) {
    //     if (err) {
    //       helper.sendSocketNotification("MINECRAFT_ERROR", {
    //         identifier: payload.identifier,
    //         message: helper.minecraftError2text(err),
    //       });
    //     } else {
    //       var timeSec = new Date() - startTime;
    //       var playerCount = resp.numPlayers
    //         ? resp.numPlayers
    //         : resp.playersOnline;
    //       helper.sendSocketNotification("MINECRAFT_UPDATE", {
    //         identifier: payload.identifier,
    //         players: playerCount,
    //         latency: timeSec,
    //       });
    //     }
    //   });
    // }
    if (notification === "MINECRAFT_SERVER_PLAYER_LIST") {
      //   console.log(
      //     "[MinecraftStatus] MCPinging " + payload.hostname + ":" + payload.port
      //   );
      var parameters = { host: payload.hostname, port: payload.port };
      var startTime = new Date();
      var helper = this;
      axios
        .get(`https://api.mcsrvstat.us/2/${parameters.host}:${parameters.port}`)
        .then(function (response) {
          let playerListData;
          if (typeof response.data.players.list === "undefined") {
            playerListData = "No Players online";
          } else playerListData = response.data.players.list;
          //   console.log(response.data.players.list);
          helper.sendSocketNotification("MINECRAFT_PLAYER_LIST_UPDATE", {
            identifier: payload.identifier,
            playerList: playerListData,
          });
        });
    }
  },

  /*
   * The server payload passed here is expected to be an instance of Error class.
   * Most subclasses have an errno property.  If it's there and we recognize it, give the user
   * a nice message.  If not, or there is no errno property, bail-out and use the message prop.
   *
   * Examples of what can come back from the server:
   * Timeout:           { "errno": "ETIMEDOUT",    "address": "173.79.111.20" ... }
   * DNS lookup failed: { "errno": "ENOTFOUND",    "message": "getaddrinfo ENOTFOUND myhost..." ... }
   * Wrong port num:    { "errno": "ECONNREFUSED", "address": "127.0.0.1", "port": 12345, ... }
   */
  minecraftError2text: function (payload) {
    switch (payload.errno) {
      case "ETIMEDOUT":
        return "Timed-out contacting Minecraft server";
      case "ENOTFOUND":
        return "Host " + payload.address + " was not found";
      case "ECONNREFUSED":
        return (
          "Connection refused from " + payload.address + ":" + payload.port
        );
      case "ECONNRESET":
        return "Minecraft server closed the connection";
      case "EHOSTUNREACH":
        return payload.address + " is unreachable";
      case "ENETUNREACH":
        return (
          "Network between here and " + payload.address + " is unreachable"
        );

      default:
        // not a known type, grab generic message from the Error object
        return payload.message;
    }
  },
});
