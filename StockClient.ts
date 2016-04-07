/**
 * StockClient
 */
const http = require('http');

interface SClientCallback {
    (error: any, data:any): void;
}

export class StockClient {
    constructor() {
        
    }
    
    getStockSymbol(input: string, callback: SClientCallback) {
        var url = `http://dev.markitondemand.com/Api/v2/Lookup/json?input=${input}`;
        var request = require('request');
        request.get(url, (error, response, body) => {
            var symbolResponse = body;

            var parsed = JSON.parse(symbolResponse);
            if (callback) {
                callback(error, parsed);
            }
        });
    }
    
    getStockPrice(symbol: string, callBack : SClientCallback )
    {
        http.get(`http://www.google.com/finance/info?q=${symbol}`, (res) => {
            console.log(`Got response: ${res.statusCode}`);
            if(res.statusCode == 400)
            {
                console.log("not found");
            }

            // consume response body
            var pageData = '';

            res.on('data', function(chunk) {
                pageData += chunk;
            });

            res.on('end', function() {
                pageData = pageData.substring(3); //remove "//" from response.
                var parsed = JSON.parse(pageData);
                if(callBack){
                    callBack(null, parsed);
                }
            });

            res.resume();
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
            if(callBack)
            {
                callBack(e, null);
            }
        });
    }
}
