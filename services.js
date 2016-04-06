var https = require('https');
var http = require('http');
var exports = module.exports = {};

exports.GetLUISInfo = function(sourceText, callBack) {
    var requestUri = `https://api.projectoxford.ai/luis/v1/application?id=07c4c72e-d229-4c7b-96db-2034c036d30e&subscription-key=c2ba4a70587642b7a4cada97a40584ed&q=${sourceText}`;
    https.get(requestUri, (response) => {
        if (callBack) {
            var pageData = '';

            response.on('data', function(chunk) {
                //console.log(chunk);
                pageData += chunk;
            });

            response.on('end', function() {
                //console.log(pageData);
                var parsed = JSON.parse(pageData);
                callBack(parsed);
            });

            response.resume();
        }
    }).on('error', (error) => {
        console.log(error);
    });
};

exports.getStockSymbol = (input, callback) => {
  var url = `http://dev.markitondemand.com/Api/v2/Lookup/json?input=${input}`;
  http.get(url, (response) => {
      var symbolResponse = '';
      
      response.on('data', (chunk) => {
          symbolResponse = symbolResponse + chunk;
      });
      
      response.on('end', () => {
            var parsed = JSON.parse(symbolResponse);
            if(callback)
            {
                callback(parsed);
            }
      });
      
      response.resume();
  }).on('error', (err) => {
      console.log('Error !');
  });  
};
