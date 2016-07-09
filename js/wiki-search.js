$("#srsearch").keyup(function(e){
	if (e.keyCode === 13){
		$( "#srsearch" ).autocomplete( "close" );
	} else {
	var q = $("#srsearch").val();
	$.getJSON("http://en.wikipedia.org/w/api.php?callback=?",
	{
		srsearch: q,
		action: "query",
		list: "search",
		format: "json"
	},
	
	function(data) {
		console.log(data);
		$("#results").empty();
		$("#results").append("Results for <b>" + q + "</b>");
		$.each(data.query.search, function(i,item){
			$("#results").append("<div><a href='http://en.wikipedia.org/wiki/" + encodeURIComponent(item.title) + "'>" + item.title + "</a>" + item.snippet + "</div>");
		});
		$("#total").html(data.query.searchinfo.totalhits);
	});
	}
});

			
$("#srsearch").autocomplete({
	source: function(request, response) {
		$.ajax({
				url: "http://en.wikipedia.org/w/api.php",
				dataType: "jsonp",
				data: {
						'action': "opensearch",
						'format': "json",
						'search': request.term
				},
				success: function(data) {
						response(data[1]);
				}
		});
	}
});

$( "#randomSearch" ).click(function() {
	$("#srsearch").val();														
  $.getJSON("http://en.wikipedia.org/w/api.php?callback=?",
	{
		action: "query",
		list: "random",
		format: "json"
	},
	function(data) {
		console.log(data);
		$("#results").empty();
		$("#results").append("Random result:");
		$.each(data.query.random, function(i,item){
			$("#results").append("<div><a href='http://en.wikipedia.org/wiki/" + encodeURIComponent(item.title) + "'>" + item.title + "</a></div>");
		});
	});
});

			


