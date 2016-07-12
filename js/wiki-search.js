var terms, totalRecords;
var lastContinue = [];
var offset = false;


/**
 * @summary Handle different events when document is ready.
 */
$( document ).ready( function() {
  $( "#srsearch" ).focus();
	
	$( "#srsearch" ).change( function( e ) {
		terms = $( "#srsearch" ).val();
		if( terms ) {
			getWikiResults();
		}
	});
	
	$( "#srsearch" ).keyup( function( e ) {
		terms = $( "#srsearch" ).val();
		if ( e.keyCode === 13 ) {
			$( "#srsearch" ).autocomplete( "close" );
		}
		if( terms ) {
			getWikiResults();
		}
	});
	
	$( "#randomSearch" ).click( function() {
		$( "#srsearch" ).val( "" );
		getRandomPages();
	});

	$( "#next" ).click( function() {
		offset = true;
		getWikiResults();							
	});

	$( "#previous" ).click( function() {
		offset = true;
		setOffsetForPrevious();
		getWikiResults();							
	});
});


/**
 * @summary Prepares data for query to wikipedia and triggers request to get Wikipedia entries.
 */
getWikiResults = function() {
	var url = "http://en.wikipedia.org/w/api.php?callback=?";
	var args = {
		srsearch: terms,
		action: "query",
		list: "search",
		format: "json"
	}
	if(( offset ) && !jQuery.isEmptyObject ( lastContinue )) {
		for( key in lastContinue ){
			args[key] = lastContinue[key];
		}
		offset = false;
	}
	getData( url, args, displayData );
}

/**
 * @summary Prepares data for query to get random pages and triggers request.
 */
getRandomPages = function () {
	var url = "http://en.wikipedia.org/w/api.php?callback=?";
	var data = {
		action: "query",
		generator: "random",
		format: "json",
		grnlimit: 10,
		grnnamespace: 0,
		prop: "extracts",
		exlimit: 10,
		exintro: true
	};
	getData( url, data, displayRandomPages );
}

/**
 * @summary Callback function after getting random pages from wikipedia.
 *
 * @param object $response Response object from request to MediaWiki.
 */
displayRandomPages = function( response ) {
	$( "#results" ).empty();
	$( "#results" ).append( "Random result:" );
	$.each( response.query.pages, function( i, item ){
		$( "#results" ).append( "<div><a href='http://en.wikipedia.org/wiki/" + encodeURIComponent( item.title ) + " '> " + item.title + "</a>" + item.extract + "</div>");
	});
	$( "#total" ).css( "display", "none" );
	$( "#next" ).css( "display", "none" );
	$( "#previous" ).css( "display", "none" );
}

/**
 * @summary Sends JSON request to get data from url.
 *
 * @param string $url Url to fetch data from.
 * @param object $data Data to be passed with query.
 * @param string $callback Name of the callbeck function.
 *
 * @return function Callback function is returned with response from query.
 */
function getData( url, data, callback ) {
	$.getJSON( url, data, callback );
}

/**
 * @summary Callback function after fetching data from MediaWiki Api. Handles the display of fetched data.
 *
 * @param object $wikiResults Result object after fetching data from MediaWiki Api.
 */
function displayData( wikiResults ) {
	$( "#results" ).empty();
	$( "#results" ).append( "Results for <b>" + terms + "</b>" );
	$.each( wikiResults.query.search, function( i, item ) {
		$( "#results" ).append( "<div><a href='http://en.wikipedia.org/wiki/" + encodeURIComponent( item.title ) + " '> " + item.title + "</a>" + item.snippet + "</div>");
	});
	totalRecords =  wikiResults.query.searchinfo.totalhits;
	$( "#total" ).css( "display", "inline-block" );
	$( "#total" ).html( "Total Records: " + totalRecords );
	$( "#next" ).css( "display", "inline-block" );
	$( "#previous" ).css( "display", "inline-block" );
	if( wikiResults.continue ) {
		lastContinue = wikiResults.continue;
	} else {
		lastContinue = [];
	}
}

/**
 * @summary Autocomplete from jQueryUI, sends AJAX request to fetch entries from MediaWiki.
 */
$( "#srsearch" ).autocomplete ({
	source: function( request, response ) {
		$.ajax ({
				url: "http://en.wikipedia.org/w/api.php",
				dataType: "jsonp",
				data: {
						'action': "opensearch",
						'format': "json",
						'search': request.term
				},
				success: function( data ) {
						response( data[1] );
				}			
		});
	}
});

/**
 * @summary Triggers data fetching from MediaWiki on autocomplete close event.
 */
 $( "#srsearch" ).on( "autocompleteclose", function( event, ui ) {
	terms = $( "#srsearch" ).val();
	if( terms ) {
		getWikiResults();
	}																								
});

/**
 * @summary Calculates the offset to be set with previous page load and update the globals.
 */
 function setOffsetForPrevious() {
	var currentOffset;
	if( lastContinue["sroffset"] ) {
		currentOffset = lastContinue["sroffset"];
	} else {
		currentOffset = ( Math.ceil( totalRecords / 10 ) * 10 ) + 10;
	}
	var offsetForPrevious = currentOffset - 20;
	if( offsetForPrevious > 0 ) {
		lastContinue["sroffset"] = offsetForPrevious;
		lastContinue["continue"] = "-||";
	} else {
		lastContinue = [];
	}
}