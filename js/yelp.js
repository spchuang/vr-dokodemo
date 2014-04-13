function getYelpResults() {
    $( "#desc1" ).fadeOut( "slow", function() {
        $("#desc1").html("");
     });

    $( "#desc2" ).fadeOut( "slow", function() {
        $("#desc2").html("");
     });


    var auth = {
                //
                // Update with your auth tokens.
                //
                consumerKey : "a68dd5oIoEFcpl96-Lezig",
                consumerSecret : "w95XAxHZbWACYGhfeKdkgWQZnX0",
                accessToken : "j8r6Rx5eDpOUbEB4vhCTMfP9SUfzLqu9",
                // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
                // You wouldn't actually want to expose your access token secret like this in a real application.
                accessTokenSecret : "rnPolNTqeNFYHJSB1lHW7_iCTtU",
                serviceProvider : {
                    signatureMethod : "HMAC-SHA1"
                }
            };

            var terms = 'food';
            var ll = '37.788022,-122.399797';

            var accessor = {
                consumerSecret : auth.consumerSecret,
                tokenSecret : auth.accessTokenSecret
            };
            parameters = [];
            parameters.push(['term', terms]);
            parameters.push(['ll', ll]);
            parameters.push(['callback', 'cb']);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

            var message = {
                'action' : 'http://api.yelp.com/v2/search',
                'method' : 'GET',
                'parameters' : parameters
            };

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            var parameterMap = OAuth.getParameterMap(message.parameters);
            console.log(parameterMap);

            $("#desc1").append("Interesting places to go: <br><br>");
            $("#desc2").append("Interesting places to go: <br><br>");

            $.ajax({
                'url' : message.action,
                'data' : parameterMap,
                'dataType' : 'jsonp',
                'jsonpCallback' : 'cb',
                'success' : function(data, textStats, XMLHttpRequest) {
                    for(i=0; i<5; i++) {
                        var location = data.businesses[i].location.address;
                        var address = "";
                        for (j=0; j<location.length;j++) {
                            address = address + " " + location[j];
                        }
                        address = address + " " + data.businesses[i].location.city;
                        console.log(address);
                        console.log(data.businesses[i].location.city);
                        $("#desc1").append("<p>" + data.businesses[i].name+"<br>\t" + address + "</p>");
                        $("#desc2").append("<p>" + data.businesses[i].name+"<br>\t" + address + "</p>");
                    }
                    console.log(data);
                    //$("body").append(output);
                }
            });

    $( "#desc1" ).fadeIn( "slow", function() {
        // Animation complete.
     });

    $( "#desc2" ).fadeIn( "slow", function() {
        // Animation complete.
     });
}