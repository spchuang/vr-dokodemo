// FILE: softcompare.js
//  (c) copyright Android Technologies, Inc.
//

// Given two word lists (or soundex/etc. lists), return the count of
//  words in the first list, that are also in the second.
function intersectingWordCount(wlist1, wlist2)
{
	var retCount = 0;
	
	if (wlist1 && wlist2)
	{
		// Convert to arrays.
		var ary1 = wlist1.split(" ");
		var ary2 = wlist2.split(" ");
		
		if ( (ary1.length > 0) && (ary2.length > 0) )
		{
			for (var i = 0; i < ary1.length; i++)
			{
				if (ary2.indexOf(ary1[i]) >= 0)
					retCount++;
			} // for()
		} // if ( (ary1.length > 0) && (ary2.length > 0) )
	} // if (wlist1 && wlist2)
	
	return retCount;
}

// Apply the given word analysis function to all words in a string.
function doAllWords(str, wfunc)
{
	var aryWords = str.split(" ");
	var retStr = "";
	
	if (aryWords.length > 0)
	{
		for (var i = 0; i < aryWords.length; i++)
		{
			if (i > 0)
				retStr += " ";
				
			retStr += wfunc(aryWords[i]);
		} // for()
	} // if (aryWords.length > 0)
	
	return retStr;
}

// Do an analysis of two soundex strings and return a score indicating
//  the similarity of the two strings.
// function doMetaSoundex

function doComparison()
{
	var str1 = document.getElementById('string1').value;
	var str2 = document.getElementById('string2').value;
	
	var str1Processed = doAllWords(str1, soundex);
	var str2Processed = doAllWords(str2, soundex);
	
	document.getElementById('soundex1').innerHTML = "Soundex =" + str1Processed;
	document.getElementById('soundex2').innerHTML = "Soundex =" + str2Processed;

	document.getElementById('compresult').innerHTML = '<p>Levenshtein distance: ' + levenshtein(str1Processed, str2Processed) + '</p>';
}
