/**
 * StockClient
 */
class StockClient {
    constructor() {
        
    }
    
    getStockSymbol(input: string, callback: any) {
        var url = `http://dev.markitondemand.com/Api/v2/Lookup/json?input=${input}`;
        var request = require('request');
        request.get(url, (error, response, body) => {
            var symbolResponse = body;

            var parsed = JSON.parse(symbolResponse);
            if (callback) {
                callback(parsed);
            }
        });
    }
}