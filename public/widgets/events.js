var BigNeonWidget = {};
(function (context) {
	/** Helper Functions */
	function getSyncScriptParams() {
		var scripts = document.getElementsByTagName("script");
		var lastScript = scripts[scripts.length-1];
		return {
			organizationId: lastScript.getAttribute("data-organization-id"),
			target: lastScript.getAttribute("data-target"),
			apiUrl: lastScript.getAttribute("data-api-url"),
			baseUrl: lastScript.getAttribute("data-base-url"),
			style: lastScript.getAttribute("data-style")
		};
	}

	function xhr(method, uri, body, handler) {
		var req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (req.readyState === 4 && handler) {
				handler(req.responseText);
			}
		};
		req.open(method, uri, true);
		req.setRequestHeader("Content-Type", "application/json");
		req.send(body);
	}

	function formatAMPM(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? "pm" : "am";
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = ("0"+minutes).slice(-2);
		var strTime = hours + ":" + minutes + " " + ampm;
		return strTime;
	}

	function getPrice(event) {
		var min = event.min_ticket_price / 100;
		var max = event.max_ticket_price / 100;
		var priceText = "";
		if (min > 0 || max > 0) {
			priceText = min === max ? `$${min}` : `$${min} - $${max}`;
		}
		return priceText;
	}
	/** End Helper Functions */
	context.events = false;
	context.params = getSyncScriptParams();

	context.fetch = function (page) {
		page = page || 0;
		xhr("GET", `${context.params.apiUrl}events?page=${page}&organization_id=${context.params.organizationId}`, null, function(eventsString) {
			try {
				context.events = JSON.parse(eventsString);
				context.render(context.events, true);
			}catch(e) {
				console.error(e);
			}
		});
	};

	context.render = function(events, firstRender) {
		if (firstRender && context.params.style) {
			var head = document.head || document.getElementsByTagName("head")[0],
				style = document.createElement("style");
			style.type = "text/css";
			style.appendChild(document.createTextNode(window.atob(context.params.style)));
			head.appendChild(style);
		}
		if (!events) {
			events = context.events;
		}
		var days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let target = context.params.target;
		let regexp = /^[^a-zA-Z]/;
		target = regexp.test(target) ? target : `#${target}`;
		var parent = document.querySelector(target);

		events.data.forEach(event => {
			var eventDate = new Date(event.event_start);
			var doorTime = new Date(event.door_time);
			var priceText = getPrice(event);

			var row = document.createElement("a");
			row.setAttribute("href", `${context.params.baseUrl}events/${event.id}`);
			row.setAttribute("target", "_blank");

			var eventModuleContainer = document.createElement("div");
			eventModuleContainer.className = "event-container";
			row.appendChild(eventModuleContainer);

			var eventModuleImageContainer = document.createElement("div");
			eventModuleImageContainer.className = "event-image";
			eventModuleContainer.appendChild(eventModuleImageContainer);

			var eventModuleDate = document.createElement("h3");
			eventModuleDate.className = "event-date";
			var eventDateFormatted = `${days[eventDate.getDay()]} ${months[eventDate.getMonth()]} ${eventDate.getDate()} ${eventDate.getFullYear()}`;
			eventModuleDate.innerText = eventDateFormatted;
			eventModuleImageContainer.appendChild(eventModuleDate);

			if (event.promo_image_url) {
				var eventModuleImage = document.createElement("img");
				eventModuleImage.setAttribute("src", event.promo_image_url);
				eventModuleImage.setAttribute("alt", "event");
				eventModuleImageContainer.appendChild(eventModuleImage);
			}

			var eventModuleTextContainer = document.createElement("div");
			eventModuleTextContainer.className = "event-text";
			eventModuleContainer.append(eventModuleTextContainer);

			var eventModuleDateMobile = document.createElement("h3");
			eventModuleDateMobile.className = "event-date-mobile";
			eventModuleDateMobile.innerText = eventDateFormatted;
			eventModuleTextContainer.appendChild(eventModuleDateMobile);

			var eventModuleArtists = document.createElement("h2");
			eventModuleArtists.className = "event-artists";
			eventModuleArtists.innerText = event.name;
			eventModuleTextContainer.appendChild(eventModuleArtists);

			var eventModuleTime = document.createElement("p");
			eventModuleTime.className = "event-time";
			eventModuleTime.innerText = formatAMPM(doorTime);
			eventModuleTextContainer.appendChild(eventModuleTime);

			var eventModuleButtonContainer = document.createElement("div");
			eventModuleButtonContainer.className = "event-button";
			eventModuleContainer.appendChild(eventModuleButtonContainer);

			var eventModuleButton = document.createElement("button");
			eventModuleButton.className = "buy-button buy-button-module";
			eventModuleButton.id = `bigneon-buy-button-${event.id}`;
			eventModuleButton.innerText = "Tickets";
			eventModuleButtonContainer.appendChild(eventModuleButton);

			var eventModulePrice = document.createElement("p");
			eventModulePrice.className = "event-price";
			eventModulePrice.innerText = priceText;
			eventModuleButtonContainer.appendChild(eventModulePrice);

			parent.appendChild(row);
		});

	};
	context.fetch();

})(BigNeonWidget);
