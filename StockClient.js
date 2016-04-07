"use strict";
/**
 * StockClient
 */
var http = require('http');
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
    StockClient.prototype.getStockPrice = function (symbol, callBack) {
        http.get("http://www.google.com/finance/info?q=" + symbol, function (res) {
            console.log("Got response: " + res.statusCode);
            if (res.statusCode == 400) {
                console.log("not found");
            }
            // consume response body
            var pageData = '';
            res.on('data', function (chunk) {
                pageData += chunk;
            });
            res.on('end', function () {
                pageData = pageData.substring(3); //remove "//" from response.
                var parsed = JSON.parse(pageData);
                if (callBack) {
                    callBack(null, parsed);
                }
            });
            res.resume();
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
            if (callBack) {
                callBack(e, null);
            }
        });
    };
    return StockClient;
}());
exports.StockClient = StockClient;
//# sourceMappingURL=StockClient.js.map