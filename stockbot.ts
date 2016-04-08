/// <reference path="typings/tsd.d.ts" />

const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');
const http = require('http');
import  stockClient = require('./stockclient');
import luisclient = require('./luis-client');

const botService = new skype.BotService({
    messaging: {
        botId: process.env.BOT_ID || "64509262-bbb5-468b-bbc3-9d48cf11791d",
        serverUrl: "https://apis.skype.com",
        requestTimeout: 15000,
        appId: process.env.APP_ID || "30a5ed7b-8880-4025-b765-50094b992afc",
        appSecret: process.env.APP_SECRET || "YtzrLy0VFiiYzSa4FQeucbu"
    }
});

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

botService.on('personalMessage', (bot, data) => {

    console.log("Message received \n" + JSON.stringify(data));
    //bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
    if (data.content !== "") {
        //stockClient.getStockSymbol('test', (error, data) => {});
        // http.get(`http://www.google.com/finance/info?q=${data.content}`, (res) => {
        //     console.log(`Got response: ${res.statusCode}`);
        //     if(res.statusCode == 400)
        //     {
        //         console.log("not found")
        //         bot.reply(`Sorry, specified stock quote identifier "${data.content}" not found!`, true);
        //     }
        //     // consume response body
        //     var pageData = '';

        //     res.on('data', function(chunk) {
        //         pageData += chunk;
        //     });

        //     res.on('end', function() {
        //         //console.log("end - " + pageData);
        //         pageData = pageData.substring(3); //remove "//" from response.
        //         var parsed = JSON.parse(pageData);
        //         //console.log(JSON.stringify(parsed));
        //         bot.reply(`Here is the current stock value : "${parsed[0].t} ${parsed[0].l}" from ${parsed[0].e}.`, true);
        //     });

        //     res.resume();
        // }).on('error', (e) => {
        //     console.log(`Got error: ${e.message}`);
        //     bot.reply(`Error! "${e.message}".`, true);
        // });

    }
});

botService.on('groupMessage', (bot,message) => {
    console.log("received a group message");
});

const server = restify.createServer();

/* Uncomment following lines to enable https verification for Azure.
server.use(skype.ensureHttps(true));
server.use(skype.verifySkypeCert({}));
*/

server.post('/v1/message', skype.messagingHandler(botService));
server.post('/v1/call', function(data) {
    console.log("Call recevied" + data)
});

// const port = process.env.PORT || 8080;
// server.listen(port);
// console.log('Listening for incoming requests on port ' + port);

var sclient = new stockClient.StockClient()
sclient.getStockSymbol('Micro', (error, data) => {
    if(error) console.log(error);
    if(data) {
        //console.log(data);
        data.forEach( (symbol) =>{
            sclient.getStockPrice(symbol.Symbol, (error, data) => {
                if(error) console.log(error);
                if(data) {
                    //console.log(data);
                    data.forEach((stockInfo) => {
                        console.log(`${stockInfo.t} : ${stockInfo.l}`);
                    })
                };
            });
        });
    }
});

var lclient = new luisclient.LUISClient();
lclient.GetLUISInfo("get microsft stock price", (error, data) => {
    console.log(data);
    lclient.getPrimaryIntent(data)
})