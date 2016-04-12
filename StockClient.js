"use strict";
/**
 * StockClient
 */
var fetch = require('node-fetch');
var StockClient = (function () {
    function StockClient() {
    }
    StockClient.prototype.getStockSymbol = function (input, callback) {
        var url = "http://dev.markitondemand.com/Api/v2/Lookup/json?input=" + input;
        fetch(url)
            .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }
            else {
                callback({
                    url: res.url,
                    status: res.status,
                    statusText: res.statusText
                }, null);
            }
        })
            .then(function (data) {
            if (callback) {
                callback(null, data);
            }
        });
    };
    StockClient.prototype.getStockPrice = function (symbol, callback) {
        var url = "http://www.google.com/finance/info?q=" + symbol;
        fetch(url)
            .then(function (res) {
            if (res.status === 200) {
                return res.text();
            }
            else {
                callback({
                    url: res.url,
                    status: res.status,
                    statusText: res.statusText
                }, null);
            }
        }).then(function (data) {
            data = data.substring(3); //remove "//" from response.
            var parsed = JSON.parse(data);
            if (callback) {
                callback(null, parsed);
            }
        });
    };
    return StockClient;
}());
exports.StockClient = StockClient;
