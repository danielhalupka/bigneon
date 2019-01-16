//Disables and enables scrolling on the html body when a dialog is open on iOS
//Mostly fixes a safari scroll bug
//https://bugs.webkit.org/show_bug.cgi?id=153852

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export default (disable) => {
	if (isIOS) {
		document.getElementsByTagName("body")[0].style.overflowY = (disable ? "hidden" : "scroll");
		document.getElementsByTagName("html")[0].style.position = (disable ? "fixed" : "static");
		document.getElementsByTagName("html")[0].style.height = (disable ? "100%" : "auto");
	}
};
