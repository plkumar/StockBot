/// <reference path="typings/tsd.d.ts" />
"use strict";
const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');
const builder = require('botbuilder');
const stockClient = require('./stockclient');
var luisBaseUrl = "https://api.projectoxford.ai/luis/v1/application";
var applicationId = "07c4c72e-d229-4c7b-96db-2034c036d30e";
var subscriptionKey = "c2ba4a70587642b7a4cada97a40584ed";
var model = process.env.model || `${luisBaseUrl}?id=${applicationId}&subscription-key=${subscriptionKey}&q=`;
var dialog = new builder.LuisDialog(model);
const botService = new skype.BotService({
    messaging: {
        botId: process.env.BOT_ID || "64509262-bbb5-468b-bbc3-9d48cf11791d",
        serverUrl: "https://apis.skype.com",
        requestTimeout: 15000,
        appId: process.env.APP_ID || "30a5ed7b-8880-4025-b765-50094b992afc",
        appSecret: process.env.APP_SECRET || "YtzrLy0VFiiYzSa4FQeucbu"
    }
});
// Create bot and add dialogs
var bot = new builder.SkypeBot(botService);
bot.add('/', dialog);
dialog.on("Greeting", function (session, args) {
    var greetings = [
        "Hi there!",
        "Hello ",
        "Hola",
        "Hallo",
        "Hi",
        "Hello there!"
    ];
    var i = Math.round(Math.random() * (greetings.length - 1));
    session.send(`${greetings[i]}!.`);
});
dialog.on("GetStockQuote", [
    function (session, args, next) {
        console.log("args :: \n" + JSON.stringify(args.entities));
        var symbol = builder.EntityRecognizer.findEntity(args.entities, 'company');
        if (!symbol) {
            builder.Prompts.text(session, "Which company stock you are intrested in?");
        }
        else {
            next({ response: symbol.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            // ... save task
            //session.send("Ok... Added the '%s' task.", results.response);
            var sclient = new stockClient.StockClient();
            sclient.getStockSymbol(results.response, (error, data) => {
                if (error)
                    console.log(error);
                if (data) {
                    //console.log(data);
                    var symbolText = '';
                    data.forEach((symbol) => {
                        symbolText = `${symbolText},${symbol.Symbol}`;
                    });
                    console.log("Symbols :" + symbolText);
                    QueryStockPrice(sclient, symbolText, function (message) {
                        session.send(message);
                    });
                }
            });
        }
        else {
            session.send("Ok..");
        }
    }
]);
function QueryStockPrice(sclient, symbol, callBack) {
    sclient.getStockPrice(symbol, (error, data) => {
        if (error)
            console.log(error);
        if (data) {
            data.forEach((stockInfo) => {
                console.log(`${stockInfo.t} : ${stockInfo.l}`);
                callBack(`Here is the current stock value : "${stockInfo.t} ${stockInfo.l}" from ${stockInfo.e}.`);
            });
        }
        ;
    });
}
dialog.on("GetVersion", builder.DialogAction.send('StockBot version 0.1a'));
// Create bot and add dialogs
botService.on('contactRemoved', (bot, event) => {
    console.log(`We lost user ${event.from}.`);
});
botService.on('contactAdded', (bot, data) => {
    console.log("Contact Added");
    bot.reply(`Hello ${data.fromDisplayName}!`, true);
});
botService.on('message', (bot, data) => {
    console.log("message received ");
});
botService.on('personalMessage', (bot, botdata) => {
    console.log(botdata);
    //console.log("Message received \n" + JSON.stringify(data));
    //bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
    // if (botdata.content !== "") {
    //     var lclient = new luisclient.LUISClient();
    //     lclient.GetLUISInfo(botdata.content, (error, data) => {
    //         console.log(data.intents);
    //         var primaryIntent = lclient.getPrimaryIntent(data);
    //         console.log(primaryIntent);
    //         switch (primaryIntent.intent) {
    //             case "Greeting":
    //                 var greetings = [
    //                     "Hi there!",
    //                     "Hello ",
    //                     "Hola",
    //                     "Hallo",
    //                     "Hi",
    //                     "Hello there!"
    //                 ];
    //                 var i = Math.round(Math.random() * (greetings.length - 1));
    //                 bot.reply(`${greetings[i]} ${botdata.from}. `, true);
    //                 break;
    //             case "GetStockQuote":
    //                 var sclient = new stockClient.StockClient()
    //                 sclient.getStockSymbol(primaryIntent.actions[0].parameters[0].value[0].entity, (error, data) => {
    //                     if (error) console.log(error);
    //                     if (data) {
    //                         //console.log(data);
    //                         data.forEach((symbol) => {
    //                             sclient.getStockPrice(symbol.Symbol, (error, data) => {
    //                                 if (error) console.log(error);
    //                                 if (data) {
    //                                     //console.log(data);
    //                                     data.forEach((stockInfo) => {
    //                                         console.log(`${stockInfo.t} : ${stockInfo.l}`);
    //                                         bot.reply(`Here is the current stock value : "${stockInfo.t} ${stockInfo.l}" from ${stockInfo.e}.`, true);
    //                                     })
    //                                 };
    //                             });
    //                         });
    //                     }
    //                 });
    //                 break;
    //             default:
    //                 break;
    //         }
    //     })
    // }
});
botService.on('groupMessage', (bot, message) => {
    console.log("received a group message");
});
const server = restify.createServer();
if (!process.env.DEBUG) {
    console.log("Running in release mode, enabling the HTTPS");
    /* Uncomment following lines to enable https verification for Azure.*/
    server.use(skype.ensureHttps(true));
}
server.post('/v1/message', skype.messagingHandler(botService));
server.post('/v1/call', function (data) {
    console.log("Call recevied" + data);
});
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);
//# sourceMappingURL=server.js.map