var vimeoSource =
	"https://player.vimeo.com/video/304281105?autoplay=1&color=ffffff&title=0&byline=0&portrait=0";

$(".launch-video-modal").on("click", function(e) {
	e.preventDefault();

	var $frame = $("iframe#vimeo-frame");

	// sets the source to nothing, stopping the video
	$frame.attr("src", vimeoSource);

	$("#" + $(this).data("modal-id")).modal();
});

$("#modal-video").on("shown.bs.modal", function() {});
$("#modal-video").on("hidden.bs.modal", function() {
	var $frame = $("iframe#vimeo-frame");
	// sets the source to nothing, stopping the video
	$frame.attr("src", "");
});

$(document).ready(function() {
	//Replaces social share links with actual links
	//http://www.sharelinkgenerator.com/
	var currentUrl = encodeURIComponent(window.location.href);

	var linkTemplatesIds = {
		"share-on-linkedin":
			"https://www.linkedin.com/shareArticle?mini=true&url=SHARE_URL&title=Big%20Neon&summary=&source=",
		"share-on-facebook":
			"https://www.facebook.com/sharer/sharer.php?u=SHARE_URL",
		"share-on-twitter": "https://twitter.com/home?status=SHARE_URL"
	};

	var ids = Object.keys(linkTemplatesIds);
	for (let index = 0; index < ids.length; index++) {
		var id = ids[index];
		var url = linkTemplatesIds[id].replace("SHARE_URL", currentUrl);
		$("#" + id).attr("href", url);
		$("#" + id).attr("target", "_blank");
	}
});
