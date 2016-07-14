var terms, totalRecords, bodyHeight;
var lastContinue = [];
var offset = false;
var startLimit = 1, endLimit = 10;

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
		} else {
			setDefaultDisplaySettings();
			setFooterPosition();
		}
	});
	
	$( "#randomSearch" ).click( function() {
		$( "#srsearch" ).val( "" );
		getRandomPages();
	});

	$( "#next" ).click( function() {
		offset = true;
		getWikiResults();
		updateOffsetsForNext();
	});

	$( "#previous" ).click( function() {
		offset = true;
		setRequestOffsetForPrevious();
		getWikiResults();
		updateOffsetsForPrevious();
	});
	
	bodyHeight = $( "body" ).height();
});


/**
 * @summary Reset the elements visibility to default.
 */
function setDefaultDisplaySettings() {
	$( "#results" ).empty();
	$( "#results-label" ).css( "display", "none" );
	$( "#next" ).css( "display", "none" );
	$( "#previous" ).css( "display", "none" );
}

/**
 * @summary Display the hidden elements meant for results.
 */
function setDisplayForResults() {
	$( "#results" ).empty();
	$( "#results-label" ).css( "display", "block" );
	$( "#next" ).css( "display", "inline-block" );
	$( "#previous" ).css( "display", "inline-block" );
}

/**
 * @summary Calculates the length of body and toggles the position to fixed or relative.
 */
function setFooterPosition() {
	if( $( "body" ).height() > bodyHeight ) {
		$( ".site-footer" ).css( "position", "relative" );
	} else {
		$( ".site-footer" ).css( "position", "fixed" );
	}
}

/**
 * @summary Calculates the next button offsets to be displayec per page and update the globals.
 */
function updateOffsetsForNext() {
	if(startLimit + 10 < totalRecords ) {
		startLimit += 10;
	} else {
		startLimit = 1;
	}
	if(endLimit + 10 < totalRecords ) {
		endLimit += 10;
	} else if ( endLimit == totalRecords ) {
		endLimit = 10;
	} else {
		endLimit = totalRecords;;	
	}
}

/**
 * @summary Calculates the previous button offsets to be displayec per page and update the globals.
 */
function updateOffsetsForPrevious() {
	if( startLimit !== 1 ) {
		startLimit -= 10;
	}
	if( endLimit == totalRecords ) {
		var roundedNum = Math.ceil( totalRecords / 10 ) * 10;
		endLimit = roundedNum > totalRecords ? roundedNum - 10 : roundedNum;
	} else if( endLimit > 10 ) {
		endLimit -= 10;
	}
}

/**
 * @summary Reset the display page offsets to default.
 */
function resetPageLimits() {
	startLimit = 1, endLimit = 10;
}

/**
 * @summary Prepares data for query to wikipedia and triggers request to get Wikipedia entries.
 */
getWikiResults = function() {
	if( !offset ) {
		resetPageLimits();
	}
	
	var url = "http://en.wikipedia.org/w/api.php?callback=?";
	var args = {
		srsearch: terms,
		action: "query",
		list: "search",
		format: "json"
	}
	if(( offset ) && !jQuery.isEmptyObject ( lastContinue )) {
		for( key in lastContinue ){
			args[ key ] = lastContinue[ key ];
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
		exchars: 500,
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
	setDefaultDisplaySettings();
	$( "#results-label" ).css( "display", "block" );
	$( "#results-label" ).html( "10 Random results:" );
	$.each( response.query.pages, function( i, item ){
		$( "#results" ).append( "<div class='entry hvr-fade'><a href='http://en.wikipedia.org/wiki/" + encodeURIComponent( item.title ) + " '> " + item.title + "</a>" + item.extract + "</div>");
	});
	setFooterPosition();
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
	setDisplayForResults();
	totalRecords =  wikiResults.query.searchinfo.totalhits;
	if( totalRecords < 10 ) {
		endLimit = totalRecords;
	}
	$( "#results-label" ).html( startLimit + " - " + endLimit + " from total <span id='total'></span> results for <b>" + terms + "</b>");
	$.each( wikiResults.query.search, function( i, item ) {
		$( "#results" ).append( "<div class='entry hvr-fade'><a href='http://en.wikipedia.org/wiki/" + encodeURIComponent( item.title ) + " '> " + item.title + "</a><p>" + item.snippet + " ..." + "</p></div>");
	});
	$( "#total" ).html( totalRecords );
	setFooterPosition();
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
						'search': request.term,
						'limit': 5
				},
				success: function( data ) {
						response( data[1] );
				}			
		});
	},
	focus: function(event, ui) {
		event.preventDefault();
		$(this).val(ui.item.label);
	},
	select: function(event, ui) {
		event.preventDefault();
		$(this).val(ui.item.label);
		$("#autocomplete2-value").val(ui.item.value);
	},
	open: function(e, ui) {
    $('.ui-autocomplete').css('top', $("ul.ui-autocomplete").cssUnit('top')[0] + 2);
		$('ul.ui-autocomplete').hide().fadeIn();
	},
	close: function () {
		$('ul.ui-autocomplete').show().fadeOut();
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
 function setRequestOffsetForPrevious() {
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