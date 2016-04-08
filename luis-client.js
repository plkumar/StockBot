/// <reference path="typings/tsd.d.ts" />
/// <reference path="LUISEntities.ts" />
"use strict";
var fetch = require('node-fetch');
class LUISClient {
    constructor() {
    }
    GetLUISInfo(sourceText, callback) {
        var luisBaseUrl = "https://api.projectoxford.ai/luis/v1/application";
        var applicationId = "07c4c72e-d229-4c7b-96db-2034c036d30e";
        var subscriptionKey = "c2ba4a70587642b7a4cada97a40584ed";
        //var requestUri = `${luisBaseUrl}/application?id=${applicationId}&subscription-key=${subscriptionKey}&q=${sourceText}`;
        var requestUri = `${luisBaseUrl}?id=${applicationId}&subscription-key=${subscriptionKey}&q=${sourceText}`;
        fetch(requestUri).then((res) => {
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
        }).then((data) => {
            if (callback) {
                callback(null, data);
            }
        });
    }
    getPrimaryIntent(luisInfo) {
        return luisInfo.intents.sort((a, b) => {
            return a.score < b.score ? 1 : -1;
        })[0];
    }
}
exports.LUISClient = LUISClient;
//# sourceMappingURL=luis-client.js.map