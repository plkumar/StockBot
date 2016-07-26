/// <reference path="typings/tsd.d.ts" />

const fs = require('fs');
const restify = require('restify');
import builder = require('botbuilder');
import stockClient = require('./stockclient');
import luisclient = require('./luis-client');
//let config = require("./config.json");

var luisBaseUrl = "https://api.projectoxford.ai/luis/v1/application";
var applicationId = "07c4c72e-d229-4c7b-96db-2034c036d30e";
var subscriptionKey = "c2ba4a70587642b7a4cada97a40584ed";
//var model = process.env.model || `${luisBaseUrl}?id=${applicationId}&subscription-key=${subscriptionKey}&q=`;

var model = "https://api.projectoxford.ai/luis/v1/application?id=07c4c72e-d229-4c7b-96db-2034c036d30e&subscription-key=c2ba4a70587642b7a4cada97a40584ed";

var recognizer = new builder.LuisRecognizer(model);

var connector = new builder.ChatConnector({
    appId: '30a5ed7b-8880-4025-b765-50094b992afc',
    appPassword: 'Tj7M9CqAyPq5rZBHeYSKpQP'
});

var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

//var connector = new builder.ConsoleConnector().listen();

var bot = new builder.UniversalBot(connector);

bot.dialog("/", dialog);

//=========================================================
// Activity Events
//=========================================================

bot.on('conversationUpdate', function (message) {
   // Check for group conversations
    if (message.address.conversation.isGroup) {
        // Send a hello message when bot is added
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                            .address(message.address)
                            .text("Hello everyone!");
                    bot.send(reply);
                }
            });
        }

        // Send a goodbye message when bot is removed
        if (message.membersRemoved) {
            message.membersRemoved.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Goodbye");
                    bot.send(reply);
                }
            });
        }
    }
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});

bot.on('typing', function (message) {
    // User is typing
});

bot.on('deleteUserData', function (message) {
    // User asked to delete their data
    console.log("User removed the contact, and requested");
});

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Dialogs
//=========================================================

dialog.onBegin(function (session, args, next){
    var msg = new builder.Message(session) 
            .attachments([ 
                new builder.SigninCard(session).text("You must first signin to your account.") 
                    .button("signin", "http://example.com/") 
            ]); 
        session.send(msg);
    next();
});

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));

dialog.matches("Greeting", function(session, args) {

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
    session.send(`How can i help you?`);
});

dialog.matches("GetStockQuote", [
    function(session, args, next) {
        console.log("args :: \n" + JSON.stringify(args.entities));
        var symbol = builder.EntityRecognizer.findEntity(args.entities, 'company');
        if (!symbol) {
            builder.Prompts.text(session, "Which company stock you are intrested in?");
        } else {
            next({ response: symbol.entity, resumed: builder.ResumeReason.forward } as builder.IDialogResult<string>);
        }
    },
    function(session, results) {
        if (results.response) {
            // ... save task
            //session.send("Ok... Added the '%s' task.", results.response);
            var sclient = new stockClient.StockClient()
            sclient.getStockSymbol(results.response, (error, data) => {
                if (error) console.log(error);
                if (data) {
                    //console.log(data);
                    var symbolText = '';
                    data.forEach((symbol) => {
                        symbolText = `${symbolText},${symbol.Symbol}`;
                    });

                    console.log("Symbols :" + symbolText);
                    QueryStockPrice(sclient, symbolText, function(message) {
                        session.send(message);
                    });
                }
            });
        } else {
            session.send("Ok..");         
        }
    }
]);

function QueryStockPrice(sclient: stockClient.StockClient, symbol: string, callBack: any) {
    sclient.getStockPrice(symbol, (error, data) => {
        if (error) console.log(error);
        if (data) {
            data.forEach((stockInfo) => {
                console.log(`${stockInfo.t} : ${stockInfo.l}`);
                callBack(`Here is the current stock value : "${stockInfo.t} ${stockInfo.l}" from ${stockInfo.e}.`);
            })
        };
    });
}

dialog.matches("GetVersion", builder.DialogAction.send('StockBot version 0.1a'));

// // Create bot and add dialogs
// botService.on('contactRemoved', (bot, event) => {
//     console.log(`We lost user ${event.from}.`);
// });

// botService.on('contactAdded', (bot, data) => {
//     console.log("Contact Added");
//     bot.reply(`Hello ${data.fromDisplayName}!`, true);
// });

// botService.on('message', (bot, data) => {
//     console.log("message received ");
// });

// botService.on('personalMessage', (bot, botdata) => {
//     console.log(botdata);
//     //console.log("Message received \n" + JSON.stringify(data));
//     //bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
// });

// botService.on('groupMessage', (bot, message) => {
//     console.log("received a group message");
// });

const server = restify.createServer();

if (!process.env.DEBUG) {
    console.log("Running in release mode, enabling the HTTPS");
    /* Uncomment following lines to enable https verification for Azure.*/
    // server.use(skype.ensureHttps(true));
    // server.use(skype.verifySkypeCert({}));
}


server.post('/api/messages', connector.listen());

const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);

