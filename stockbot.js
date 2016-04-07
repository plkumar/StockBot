/// <reference path="typings/tsd.d.ts" />
"use strict";
var fs = require('fs');
var restify = require('restify');
var skype = require('skype-sdk');
var http = require('http');
var stockClient = require('./StockClient');
var botService = new skype.BotService({
    messaging: {
        botId: process.env.BOT_ID || "64509262-bbb5-468b-bbc3-9d48cf11791d",
        serverUrl: "https://apis.skype.com",
        requestTimeout: 15000,
        appId: process.env.APP_ID || "30a5ed7b-8880-4025-b765-50094b992afc",
        appSecret: process.env.APP_SECRET || "YtzrLy0VFiiYzSa4FQeucbu"
    }
});
botService.on('contactRemoved', function (bot, event) {
    console.log("We lost user " + event.from + ".");
});
botService.on('contactAdded', function (bot, data) {
    console.log("Contact Added");
    bot.reply("Hello " + data.fromDisplayName + "!", true);
});
botService.on('message', function (bot, data) {
    console.log("message received ");
});
botService.on('personalMessage', function (bot, data) {
    console.log("Message received \n" + JSON.stringify(data));
    //bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
    if (data.content !== "") {
    }
});
botService.on('groupMessage', function (bot, message) {
    console.log("received a group message");
});
var server = restify.createServer();
/* Uncomment following lines to enable https verification for Azure.
server.use(skype.ensureHttps(true));
server.use(skype.verifySkypeCert({}));
*/
server.post('/v1/message', skype.messagingHandler(botService));
server.post('/v1/call', function (data) {
    console.log("Call recevied" + data);
});
var port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);
var sclient = new stockClient.StockClient();
sclient.getStockSymbol('test', function (error, data) {
    console.log(data);
});
//# sourceMappingURL=stockbot.js.map