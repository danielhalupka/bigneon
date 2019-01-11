import ReactGA from "react-ga";

const GOOGLE_ANALYTICS_KEY = process.env.REACT_APP_GOOGLE_ANALYTICS_KEY;
const SEGMENT_KEY = process.env.REACT_APP_SEGMENT_KEY;

let referrer = ""; //Previous href to be used for segment page tracking

const initSegment = () => {
	if (!SEGMENT_KEY) {
		console.warn("No segment write key found.");
		return;
	}

	// Create a queue, but don't obliterate an existing one!
	const analytics = window.analytics = window.analytics || [];

	// If the real analytics.js is already on the page return.
	if (analytics.initialize) return;

	// If the snippet was invoked already show an error.
	if (analytics.invoked) {
		if (window.console && console.error) {
			console.error("Segment snippet included twice.");
		}
		return;
	}

	// Invoked flag, to make sure the snippet
	// is never invoked twice.
	analytics.invoked = true;

	// A list of the methods in Analytics.js to stub.
	analytics.methods = [
		"trackSubmit",
		"trackClick",
		"trackLink",
		"trackForm",
		"pageview",
		"identify",
		"reset",
		"group",
		"track",
		"ready",
		"alias",
		"debug",
		"page",
		"once",
		"off",
		"on"
	];

	// Define a factory to create stubs. These are placeholders
	// for methods in Analytics.js so that you never have to wait
	// for it to load to actually record data. The `method` is
	// stored as the first argument, so we can replay the data.
	analytics.factory = function(method){
		return function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift(method);
			analytics.push(args);
			return analytics;
		};
	};

	// For each of our methods, generate a queueing stub.
	for (let i = 0; i < analytics.methods.length; i++) {
		const key = analytics.methods[i];
		analytics[key] = analytics.factory(key);
	}

	// Define a method to load Analytics.js from our CDN,
	// and that will be sure to only ever load it once.
	analytics.load = function(key, options){
		// Create an async script element based on your key.
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.async = true;
		script.src = "https://cdn.segment.com/analytics.js/v1/"
			+ key + "/analytics.min.js";

		// Insert our script next to the first script element.
		const first = document.getElementsByTagName("script")[0];
		first.parentNode.insertBefore(script, first);
		analytics._loadOptions = options;
	};

	// Add a version to keep track of what's in the wild.
	analytics.SNIPPET_VERSION = "4.1.0";

	// Load Analytics.js with your key, which will automatically
	// load the tools you've enabled for your account. Boosh!
	analytics.load(SEGMENT_KEY);

	// Make the first page call to load the integrations. If
	// you'd like to manually name or tag the page, edit or
	// move this call however you'd like.
	page();
};

const initGA = () => {
	if (!GOOGLE_ANALYTICS_KEY) {
		console.warn("No google analytics key found.");
		return;
	}

	ReactGA.initialize(GOOGLE_ANALYTICS_KEY);
};

const init = () => {
	initSegment();
	initGA();
};

const identify = ({ id, firstName, lastName, email, method }) => {
	const analytics = window.analytics; //Segment analytics

	if (analytics) {
		analytics.identify(id, {
			firstName,
			lastName,
			email
		});
	}

	//If this function is called from login/sign up it needs additional tracking functions
	switch (method) {
		case "login" :
			if (analytics) {
				analytics.track("Signed In");
			}
			break;
		case "signup" :
			if (analytics) {
				analytics.track("Signed Up");
			}
			break;
	}
};

const page = ()  => {
	const analytics = window.analytics; //Segment analytics

	if (analytics) {
		analytics.page({
			path: window.location.pathname,
			referrer,
			search: window.location.search,
			url: window.location.href
		}); //Segment

		//For next page track
		referrer = window.location.href;
	}

	if (GOOGLE_ANALYTICS_KEY) {
		ReactGA.pageview(window.location.pathname + window.location.search); //GA
	}
};

export default { init, page, identify };
