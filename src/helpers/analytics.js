import ReactGA from "react-ga";

const ga = {
	name: "ga",
	// true if GA has been initialized at least once
	enabled: false,
	disabledWarning: "No Google analytics key provided. Google Analytics is disabled.",

	addTrackingKey(key) {
		// GA support multiple tracking keys
		ReactGA.initialize(key);
		this.enabled = true;

		if (window[`ga-disable-${key}`]) {
			delete window[`ga-disable-${key}`];
		}
	},

	pageView() {
		const uri = window.location.pathname + window.location.search;
		ReactGA.pageview(uri);
	},

	removeTrackingKey(key) {
		window[`ga-disable-${key}`] = true;
	},

	track(category, action, data) {
		ReactGA.ga("send", "event", category, action, data);
	},

	identify(user) {
		// https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#user_id
		ReactGA.set("userId", user.id);
		ReactGA.ga("send", "event", "authentication", "user-id available");
	}
};

const facebook = {
	keys: [],
	name: "facebook",
	enabled: false,
	loaded: false,

	load() {
		// Facebook snippet
		/* eslint-disable */
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
		n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
		n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
		t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
		document,'script','https://connect.facebook.net/en_US/fbevents.js');
		/* eslint-enable */

		// Script creates an array queue which will resolve calls once the script is loaded
		// so this can be marked as loaded synchronously
		this.loaded = true;
	},

	addTrackingKey(key) {
		if (!this.loaded) {
			this.load();
		}

		// Support for multiple pixel ids: https://developers.facebook.com/docs/facebook-pixel/advanced/#multipixels
		window.fbq("init", key);
		this.keys.push(key);

		this.enabled = true;
	},

	removeTrackingKey(key) {
		const index = this.keys.indexOf(key);
		if (index > -1) {
			this.keys.splice(index, 1);
		}
	},

	pageView() {
		this.keys.forEach(k => {
			window.fbq("trackSingle", k, "PageView");
		});
	},

	track(type, data) {
		this.keys.forEach(k => {
			window.fbq("trackSingle", k, type, data);
		});
	},

	identify(user) {
		this.keys.forEach(k => {
			window.fbq("setUserProperties", k, user);
		});
	}
};

const segment = {
	name: "segment",
	enabled: false,
	disabledWarning: "No Segment write key given. Segment is disabled.",
	referrer: "",

	load(key) {
		if (this.segment) {
			// Already loaded - cannot be invoked twice
			return;
		}

		const analytics = (this.segment = []);

		if (analytics.initialize) return;

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
		analytics.factory = function(method) {
			return function() {
				const args = Array.prototype.slice.call(arguments);
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
		analytics.load = function(key, options) {
			return new Promise((resolve, _reject) => {
				// Create an async script element based on your key.
				const script = document.createElement("script");
				script.type = "text/javascript";
				script.async = true;
				script.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
				script.onload = () => {
					resolve();
				};

				// Insert our script next to the first script element.
				const first = document.getElementsByTagName("script")[0];
				first.parentNode.insertBefore(script, first);
				analytics._loadOptions = options;
			});
		};

		// Add a version to keep track of what's in the wild.
		analytics.SNIPPET_VERSION = "4.1.0";

		// Load Analytics.js with your key, which will automatically
		// load the tools you've enabled for your account. Boosh!
		return analytics.load(key);
	},

	addTrackingKey(key) {
		if (!this.loaded) {
			this.loaded = true; // Assume loading succeeds
			this.load(key);
			this.pageView();
			this.enabled = true;
		} else {
			console.warn("Implementation of segment currently does not support multiple segment keys");
		}
	},

	removeTrackingKey(_key) {
		console.warn("removeTrackingKey is no supported by Segment");
	},

	pageView() {
		const { location } = window;
		this.segment.page({
			path: location.pathname,
			referrer: this.referrer,
			search: location.search,
			url: location.href
		});

		//For next page track
		this.referrer = window.location.href;
	},

	track(event, properties, options, callback) {
		this.segment.track(event, properties, options, callback);
	},

	identify({ id, firstName, lastName, email, method }) {
		this.segment.identify(id, { firstName, lastName, email });

		//If this function is called from login/sign up it needs additional tracking functions
		switch (method) {
			case "login":
				this.segment.track("Signed In");
				break;
			case "signup":
				this.segment.track("Signed Up");
				break;
		}
	}
};

const providers = [facebook, ga, segment];

const init = providerOptions => {
	Object.keys(providerOptions).forEach(k => {
		const opts = providerOptions[k];
		addTrackingKey(k, opts);
	});
};

const addTrackingKey = (providerName, options) => {
	const provider = getProvider(providerName);
	if (!provider) {
		console.error(`No analytics provider named '${providerName}'`);
		return;
	}

	// If falsey option passed the provider is disabled
	if (!options) {
		console.warn(provider.disabledWarning || `Tracking for ${providerName} has been disabled.`);
		return;
	}

	provider.addTrackingKey(options);
};

const removeTrackingKey = (providerName, key) => {
	const provider = getProvider(providerName);
	if (!provider) {
		console.error(`No analytics provider named '${providerName}'`);
		return;
	}

	provider.removeTrackingKey(key);
};

const getProvider = name => providers.find(p => p.name == name);

const page = (...args) => {
	const enabledProviders = providers.filter(p => p.enabled);
	enabledProviders.forEach(p => p.pageView(...args));
};

// Identify for all enabled analytics providers
// @param user object {id, firstName, lastName, email, method}
const identify = user => {
	const enabledProviders = providers.filter(p => p.enabled);
	enabledProviders.forEach(p => p.identify(user));
};

export default { init, addTrackingKey, getProvider, removeTrackingKey, page, identify };
