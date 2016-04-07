/// <reference path="typings/tsd.d.ts" />
"use strict";
var https = require('https');
//var exports: any = module.exports = {};
var LUISClient = (function () {
    function LUISClient() {
    }
    LUISClient.prototype.LUISClient = function () {
    };
    LUISClient.prototype.GetLUISInfo = function (sourceText, callBack) {
        var luisBaseUrl = "https://api.projectoxford.ai/luis/v1";
        var applicationId = "07c4c72e-d229-4c7b-96db-2034c036d30e";
        var subscriptionKey = "c2ba4a70587642b7a4cada97a40584ed";
        var requestUri = luisBaseUrl + "/application?id=" + applicationId + "&subscription-key=" + subscriptionKey + "&q=" + sourceText;
        https.get(requestUri, function (response) {
            if (callBack) {
                var pageData = '';
                response.on('data', function (chunk) {
                    //console.log(chunk);
                    pageData += chunk;
                });
                response.on('end', function () {
                    //console.log(pageData);
                    var parsed = JSON.parse(pageData);
                    callBack(parsed);
                });
                response.resume();
            }
        }).on('error', function (error) {
            console.log(error);
        });
    };
    return LUISClient;
}());
function getStockSymbol(input, callback) {
    var url = "http://dev.markitondemand.com/Api/v2/Lookup/json?input=" + input;
    var request = require('request');
    request.get(url, function (error, response, body) {
        var symbolResponse = body;
        var parsed = JSON.parse(symbolResponse);
        if (callback) {
            callback(parsed);
        }
    });
}
exports.getStockSymbol = getStockSymbol;
;
