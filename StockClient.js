/**
 * StockClient
 */
var StockClient = (function () {
    function StockClient() {
    }
    StockClient.prototype.getStockSymbol = function (input, callback) {
        var url = "http://dev.markitondemand.com/Api/v2/Lookup/json?input=" + input;
        var request = require('request');
        request.get(url, function (error, response, body) {
            var symbolResponse = body;
            var parsed = JSON.parse(symbolResponse);
            if (callback) {
                callback(parsed);
            }
        });
    };
    return StockClient;
}());
