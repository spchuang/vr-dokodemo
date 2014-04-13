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
            var ll = CURRENT_LOCATION.lat + ',' + CURRENT_LOCATION.lng;

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
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
            console.log(parameterMap);

            $("#desc1").append("Interesting places to go: <br><br>");
            $("#desc2").append("Interesting places to go: <br><br>");

            //have my JSON object, do whatever we want here, like add to spreadsheets

            $.ajax({
                'url' : message.action,
                'contentType': "application/json; charset=utf-8",
                'data' : parameterMap,
                'dataType' : 'jsonp',
                 'cache':true, 
                'jsonpCallback' : 'cb',
                'success' : function(data, textStats, XMLHttpRequest) {
                    for(var i=0; i<5; i++) {
                        var location = data.businesses[i].location.address;
                        var address = "";
                        for (var j=0; j<location.length;j++) {
                            address = address + " " + location[j];
                        }
                        address = address + " " + data.businesses[i].location.city;
                        console.log(address);
                        console.log(data.businesses[i].location.city);

                        geocoder.geocode( {'address': address}, function(results, status){
                            console.log(status);
                            //teleport and move map

                            var lat = results[0].geometry.location.k;
                            var lon = results[0].geometry.location.A;
                            var myLatlng = new google.maps.LatLng(lat, lon);

                            var marker = new google.maps.Marker({
                                position: myLatlng,
                                map: gmap,
                                title: data.businesses[i].name
                            });

                            var marker2 = new google.maps.Marker({
                                position: myLatlng,
                                map: gmap2,
                                title: data.businesses[i].name
                            });

                            $("#desc1").append("<p>" + data.businesses[i].name+"<br>\t" + address + "</p>");
                            $("#desc2").append("<p>" + data.businesses[i].name+"<br>\t" + address + "</p>");
                
                        });
                    }
                    gmap.setZoom(7);
                    gmap2.setZoom(7);
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