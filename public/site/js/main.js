var vimeoSource =
	"https://player.vimeo.com/video/63777198?autoplay=1&color=ffffff&title=0&byline=0&portrait=0";

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
