"use strict";
/**
 * StockClient
 */
const fetch = require('node-fetch');
class StockClient {
    constructor() {
    }
    getStockSymbol(input, callback) {
        var url = `http://dev.markitondemand.com/Api/v2/Lookup/json?input=${input}`;
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
    }
    getStockPrice(symbol, callback) {
        var url = `http://www.google.com/finance/info?q=${symbol}`;
        fetch(url)
            .then((res) => {
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
        }).then((data) => {
            data = data.substring(3); //remove "//" from response.
            var parsed = JSON.parse(data);
            if (callback) {
                callback(null, parsed);
            }
        });
    }
}
exports.StockClient = StockClient;
//# sourceMappingURL=stockclient.js.map