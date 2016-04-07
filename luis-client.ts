/// <reference path="typings/tsd.d.ts" />
/// <reference path="LUISEntities.ts" />

var https = require('https');

interface LuisCallback {
    (response:luis.LUISResponse)
}

export class LUISClient {
    
    constructor() {

    }

    GetLUISInfo(sourceText: string, callBack: LuisCallback) {
        var luisBaseUrl = "https://api.projectoxford.ai/luis/v1";
        var applicationId = "07c4c72e-d229-4c7b-96db-2034c036d30e";
        var subscriptionKey = "c2ba4a70587642b7a4cada97a40584ed";
        var requestUri = `${luisBaseUrl}/application?id=${applicationId}&subscription-key=${subscriptionKey}&q=${sourceText}`;
        https.get(requestUri, (response) => {
            if (callBack) {
                var pageData = '';

                response.on('data', function(chunk) {
                    pageData += chunk;
                });

                response.on('end', function() {
                    var parsed : luis.LUISResponse = JSON.parse(pageData) ;
                    callBack(parsed);
                });

                response.resume();
            }
        }).on('error', (error) => {
            console.log(error);
        });
    }
}

