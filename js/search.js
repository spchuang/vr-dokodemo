// Some constants.
gPlayCommand = "play";
gTeleportCommand = "go";
gStopCommand = "stop";
gYelpCommand = "yelp";

// =========================== "Common" functions


// Add a startsWith function to String() objects.
String.prototype.startsWith = function(str)
{
    return(data.substr(0, str.length) === str);
}


// Case insensitive version of the above.
String.prototype.startsWithI = function(str)
{
    return(this.toUpperCase().substr(0, str.length) === str.toUpperCase());
}

// Class for storing the details for each video found in the video search.
function videoDetails(theVideoID, theVideoTitle)
{
	this.videoID 	= theVideoID;
	this.videoTitle = theVideoTitle;
	
	// Initialize the string comparison score "work" property.
	this.score		= 0;
}

// Array to store the video details in.
var gAryVideoDetails = new Array();

// Clears the video details array.
function clearVideoDetailsArray()
{
	gAryVideoDetails = new Array();
}

// =========================== "Common" YouTube API functions

var gJSONLastRequest = null;

var ytplayer = null;

var YT_UNSTARTED    = -1;
var YT_ENDED		= 0;
var YT_PLAYING		= 1;
var YT_PAUSED		= 2;
var YT_BUFFERING	= 3;
var YT_VIDEO_CUED	= 5;

var videoDurationInSeconds = 0;

// Called when SWFObject indicates that the YouTube player and API are ready.
function onYouTubePlayerReady(playerId) 
{
	// alert("YouTube player is ready");
		
	ytplayer = document.getElementById("myytplayer");
	ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
}

// Use the Google search "-" character to tag these keywords as "exclusion" keywords.
function prependMinuses(theFilterWords)
{
	var aryFilterWords = theFilterWords.split(" ");
	var retStr = "";
	
	if (aryFilterWords.length > 0)
	{
		for (i = 0; i < aryFilterWords.length; i++)
		{
			if (i > 0)
				retStr += " ";
			retStr += "-" + aryFilterWords[i];
		} // for()
	} // if (aryFilterWords.length > 0)
	
	return retStr;
}

// Given a list of words separated by spaces, build a string where the spaces are replaced by the Google search
//  concatenation characer.
function prepareSearchWords(theSearchWords)
{
	var arySearchWords = theSearchWords.split(" ");
	var retStr = "";
	
	if (arySearchWords.length > 0)
	{
		for (i = 0; i < arySearchWords.length; i++)
		{
			if (i > 0)
				retStr += "+";
			retStr += arySearchWords[i];
		} // for()
	} // if (arySearchWords.length > 0)
	
	return retStr;
}

function buildYouTubeSearchQuery(theKeywords, theFilterWords, theStartIndex, theMaxResults, theCallbackFunc)
{
	// EXAMPLE: http://gdata.youtube.com/feeds/api/videos?q=football+-soccer&orderby=published&start-index=11&max-results=10&v=2&alt=json-in-script&format=5
	var baseUrl = "http://gdata.youtube.com/feeds/api/videos";
	var theQuery = "";
	var theOrderBy = "published";
	
	if (theFilterWords.length > 0)
		theQuery = prepareSearchWords(theKeywords + prependMinuses(theFilterWords));
	else
		theQuery = prepareSearchWords(theKeywords);

	return baseUrl + '?' 
		+ 'q=' + theQuery
		+ '&'
		+ 'orderby=' + theOrderBy
		+ '&'
		+ 'start-index=' + theStartIndex
		+ '&'
		+ 'max-results=' + theMaxResults
		// YouTube API version and JSON format URL arguments.
		+ '&'
		+ 'v=2&alt=json-in-script&format=5'
		// Callback parameter to show videos.
		+ '&'
		+ 'callback=' + theCallbackFunc;
}

function makeJSONRequest(src)
{
    var head = document.getElementsByTagName('head')[0];
    
	// Need to delete previous request! (gJSONLastRequest)
	if (gJSONLastRequest)
		head.removeChild(gJSONLastRequest);
	
    var newRequest = document.createElement('script');
    newRequest.type = "text/javascript";
    newRequest.src = src;
    // NOT USED. newRequest.addEventListener('load', function (e) { callback(null, e); }, false);
    
    head.appendChild(newRequest);
    
    // Save the reference for deletion next time.
    gJSONLastRequest = newRequest;
}

// Sample code from Caolan, the author of the Async package.
var Loader = function () {}

Loader.prototype = {
    require: function (scripts, callback) {
        async.map(scripts, this.writeScript, callback);
    },
    writeScript: function(src, callback) {
        var s = document.createElement('script');
        s.type = "text/javascript";
        s.src = src;
        s.addEventListener('load', function (e) { callback(null, e); }, false);
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(s);
    }
}

// Returns the videoDetails object for the video title that matches the given string the
//  best. 
//
// NOTE: "Best" is defined as the video title that has the highest intersecting word count
//  with the utterance.
//
// NOTE: A side-effect of this call is that each videoDetails object in the container
//  array will contain the most recent score from the scoring operation.
//
function getClosestMatch(theUtterance)
{
	var retVideoDetails = null;
	
	if (gAryVideoDetails)
	{
		if ((gAryVideoDetails.length > 0) && (theUtterance.length > 0))
		{
			// Run soundex on all words in the utterance.
			var uttSoundex = doAllWords(theUtterance, soundex);
			
			// Initialize the best intersecting word count.
			var bestInterWordCount = -1;
			
			for (var i = 0; i < gAryVideoDetails.length; i++)
			{
				// Run soundex on all words in the video title.
				var vidtitleSoundex = doAllWords(gAryVideoDetails[i].videoTitle, soundex);
				
				// Score this videoDetails object by comparing the soundex string
				//  of the utterance to the soundex string of the videoDetails
				//  videoTitle property.
				gAryVideoDetails[i].score = intersectingWordCount(uttSoundex, vidtitleSoundex);
				
				// First iteration?
				if (bestInterWordCount === -1)
				{
					// Yes.  Just store the current score and video details.
					bestInterWordCount = gAryVideoDetails[i].score;
					retVideoDetails = gAryVideoDetails[i];
				}
				else
				{
					// No.  Only keep the new video details if it is closer to the
					//  utterance than the current champion (more intersecting words).
					if (bestInterWordCount < gAryVideoDetails[i].score)
					{
						bestInterWordCount = gAryVideoDetails[i].score;
						retVideoDetails = gAryVideoDetails[i];
					} // if (bestInterWordCount > gAryVideoDetails[i].score)
				} // else - if (bestInterWordCount === -1)
			} // for()
		} // if (gAryVideoDetails.length > 0)
	} // if (gAryVideoDetails)
	
	return retVideoDetails;
}

// Function called when a speech recognition result is received.
function inputChange(e) 
{
	var topRecoResult = null;
	
  	if (e.type == 'webkitspeechchange' && e.results) 
  	{
	    console.log('Results: ' + e.results.length)
	    for (var i = 0, result; result = e.results[i]; ++i) 
	    {
		    // Store the top level recognition result.
		    if (i == 0)
		    	topRecoResult = result;
		    
	    	console.log(result.utterance, result.confidence);
	    } // for()
	    
	    // Search for videos with the given top level result.
	    if (topRecoResult)
	    {
		    // Play Music
		    if (topRecoResult.utterance.startsWithI(gPlayCommand))
		    {
			    apiswf.rdio_play($('#play_key').val());
		    }
		    // Teleport!
		    else if (topRecoResult.utterance.startsWithI(gTeleportCommand)) {
		    	alert("teleporting to " + topRecoResult.utterance.substr(6, topRecoResult.utterance.length));
		    }
		    // Stop Music
		    else if (topRecoResult.utterance.startsWithI(gStopCommand))
		    {
			    apiswf.rdio_stop();
		    }
		    // Yelp Stuff
		    else if (topRecoResult.utterance.startsWithI(gYelpCommand))
		    {
		    	getYelpResults();
		    }
		    else
		    {
			    // ============================ VIDEO SEARCH ===============
			    
			    // Must be a video search.  Show the utterance.
			    document.getElementById('speechOutput').value = topRecoResult.utterance;
		    
			    // buildYouTubeSearchQuery(theKeywords, theStartIndex, theMaxResults, theCallbackFunc)
			    makeJSONRequest(
					buildYouTubeSearchQuery(
									topRecoResult.utterance,
									"", // No filter words. 
									1,  // theStartIndex, 
									20, // theMaxResults, 
									"showMyVideos"  // theCallbackFunc name
									));
			} // else - if (topRecoResult.utterance.startsWithI("play"))
		} // if (topRecoResult)
  	} // if (e.type == 'webkitspeechchange' && e.results) 
}

// Set up the event handlers for speech input.
function prepareSpeech()
{
	var input = document.getElementById("speechInput1");
	console.log("readying speech");
	
	if (input)
	{
		input.addEventListener('change', inputChange, false); // normal change by keyboard input
		input.addEventListener('webkitspeechchange', inputChange, false); // results from speech server 
	}
	else
	{
		alert('Speech input element not found.');
	}
}

// Given a thumbnail object, return it's size given its dimensions.
function getThumbnailSize(thumbnail)
{
	var retVal = 0;
	
	if (thumbnail)
		retVal = thumbnail.height * thumbnail.width;

	return retVal;
}

// Given a YouTube feed entry, return the the thumbnail in the thumbnail array
//  that has the smallest dimensions of all found.
function getSmallestThumbnail(entry)
{
	var theSmallThumb = null;
	
	if (entry)
	{
		// Easy access to the thumbnails array.
		var aryThumbnails = entry.media$group.media$thumbnail;
		
		var minSize = -1;
		
		if (aryThumbnails.length > 0)
		{
			for (var i = 0; i < aryThumbnails.length; i++)
			{
				var theThumbnail = aryThumbnails[i];
				// Calculate its size in pixels.
				var theThumbnailSize = getThumbnailSize(theThumbnail);
				
				if (theThumbnail)
				{
					if (minSize == -1)
					{
						// First valid thumbnail.  Just store it and it's size.
						theSmallThumb = theThumbnail;
						minSize = theThumbnailSize; 
					}
					else
					{
						// Smaller than current smallest?
						if (theThumbnailSize < minSize)
						{
							// New minimum, keep it and update the current minimum size.
							theSmallThumb = theThumbnail;
							minSize = theThumbnailSize;
						} // if (theThumbnailSize < minSize)
					} // else - if (minSize = -1)
				} // if (theThumbnail)
			} // for()
		} // if (aryThumbnails.length > 0)
	} // if (entry)
	
	// If we found a valid minimum size thumbnail, return it.
	return theSmallThumb;	
}

// Process the user selected video.
function doVideoLink(theVideoID)
{
	// Just show the HREF contents for now.
	// alert("The video link: " + theVideoHref);
	
	if (ytplayer)
	{
		// Load and play the requested video.
		ytplayer.loadVideoById(theVideoID);
	}

	/*
	
	document.getElementById('ytapiplayer').innerHTML = 
		'<object width="425" height="350"><param name="movie" value="http://www.youtube.com/v/'
		+ theVideoID
		+ '&hl=en&fs=1"></param><param name="allowFullScreen" value="true"></param><embed src="http://www.youtube.com/v/'
		+ theVideoID 
		+ '&hl=en&fs=1" type="application/x-shockwave-flash" allowfullscreen="true" width="425" height="350"></embed></object>';
	*/
		
	// alert(document.getElementById('ytapiplayer').innerHTML);
}

// Build the IMG element HTML for a feed entry's thumbnail.
function buildThumbnailHTML(theThumbnail)
{
	var retStr = "";
	
	if (theThumbnail)
	{
		// retStr = "<IMG SRC=\"" + theThumbnail.url + "\" ALIGN=\"LEFT\" />"
		retStr = "<IMG SRC=\"" + theThumbnail.url + "\" />"
		
	} // if (theThumbnail)
	return retStr;
}

function doSpeechInput()
{
	document.getElementById("speechInput1").click();
	console.log("check")
}

// Extracts the Video ID from an entry, accounting for the variance in returned
//  ID formats.
function getVideoID(entry)
{
	var retStr = "";
	
	if (entry)
	{
		// Url format for video ID?
		if (entry.id.$t.search('/') >= 0)
		{
			// Yes, use that pattern.
		    var aryVideoID = entry.id.$t.match(/[^/]+$/);
			
		    if (aryVideoID)
		    {
			    // Video ID should be the first match.
			    retStr = aryVideoID[0];
		    } // if (aryVideoID)
	    }
	    else
	    {
		    // Try alternative colon delimited format.
		    aryVideoID = entry.id.$t.match(/[^:]+$/);
		    if (aryVideoID)
		    {
			    // Video ID should be the first match.
			    retStr = aryVideoID[0];
		    } // if (aryVideoID)
	    } // else - if (entry)
	} // if (entry)
	
	return retStr;
}

// AJAX callback function called when I make YouTube JSON-IN-SCRIPT API calls.
function showMyVideos(data) 
{
  var feed = data.feed;
  var entries = feed.entry || [];
  var html = [''];
  var bNewRow = true;
  var itemsAdded = 0;
  var colCount = 2; // Number of columns to display.
  
  // Clear out the video details array.
  clearVideoDetailsArray();
  
  html.push('<TABLE CELLSPACING=10px CELLPADDING=10px ><TBODY>');
  
  // Build a table of the search results.
  for (var i = 0; i < entries.length; i++) 
  {
    var entry = entries[i];
    var title = entry.title.$t;
	// var theListItemHTML = "<a href=\"javascript:doSpeechInput();\"><IMG SRC=\"mic-alt.jpg\" /></a>";    
	var theListItemHTML = "";    
	var theThumbnailHTML = "";
    
	// Got a thumbnail?
	var theThumbnail = getSmallestThumbnail(entry);
	
	if (theThumbnail)
		theThumbnailHTML = buildThumbnailHTML(theThumbnail);
    
    // If there's a link for the video, make the title a hyperlink.
    if (entry.link.length > 0)
    {
	    /*
	    // Extract the video ID.
	    // var aryVideoID = entry.link[0].href.match(/[^/]+$/);
	    var aryVideoID = entry.id.$t.match(/[^/]+$/);
	    */
	    
	    var theVideoID = getVideoID(entry);
	    
	    if (theVideoID)
	    {
		    // Assuming that the video link is the first one.
    		var linkedTitle = "<a href=\"javascript:doVideoLink('" + theVideoID + "');\">" + title + "</a>";
    		theListItemHTML += linkedTitle;
		}
		else
		{
    		var linkedTitle = "<a href=\"alert('Unable to parse out the video ID.');\">" + title + "</a>";
    		theListItemHTML += linkedTitle;
		} // else - if (theVideoID)
	}
	else
	{
		// No links for the video.  Just show the title.
    	theListItemHTML += title;
	} // else - if (entry.link.length > 0)
	
  	// html.push('<li>', theListItemHTML, '</li><br/>');
  	
  	if (bNewRow)
  	{
		html.push('<TR>');
		bNewRow = false;
		itemsAdded = 0;
	}
		
  	html.push('<TD>', theThumbnailHTML, '</TD><TD  WIDTH="400px">', theListItemHTML, '</TD>');
  	itemsAdded++;
  	
  	if (itemsAdded === colCount)
  	{
  		// Time for a new row.
  		bNewRow = true;
  		
  		// Close out last row.
  		html.push('</TR>');
	}
  	
  	// Build the video details array.
  	gAryVideoDetails.push(new videoDetails(theVideoID, title));
  } // for()
  
  // Always close out the last row if an item was added.
  if (itemsAdded > 0)
  	html.push('</TR>');
  
  html.push('</TBODY></TABLE>');
  document.getElementById('videos').innerHTML = html.join('');
} 