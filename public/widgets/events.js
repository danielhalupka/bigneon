const BigNeonWidget = {};
(function (context) {
	/** Helper Functions */
	function getSyncScriptParams() {
		const scripts = document.getElementsByTagName("script");
		const lastScript = scripts[scripts.length - 1];
		return {
			organizationId: lastScript.getAttribute("data-organization-id"),
			target: lastScript.getAttribute("data-target"),
			apiUrl: lastScript.getAttribute("data-api-url"),
			baseUrl: lastScript.getAttribute("data-base-url"),
			style: lastScript.getAttribute("data-style")
		};
	}

	function xhr(method, uri, body, handler) {
		const req = new XMLHttpRequest();
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
		let hours = date.getHours();
		let minutes = date.getMinutes();
		const ampm = hours >= 12 ? "pm" : "am";
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = ("0" + minutes).slice(-2);
		const strTime = hours + ":" + minutes + " " + ampm;
		return strTime;
	}

	function prepareDateTime(dateTime) {
		if (!dateTime) {
			return false;
		}
		dateTime = dateTime.replace(/[a-zA-Z]+$/g, "").replace(/\.\d+$/g, "").replace(/ [-|+]+\d{4}$/,"");
		const parts = dateTime.split("T");
		return parts.join(" ");
	}

	function parseLocalizedDateTime(localizedDateTime, utcDateTime) {
		let date;
		if (localizedDateTime) {
			//Use the date time exactly as it is displayed
			date = new Date(prepareDateTime(localizedDateTime));

		} else {
			//Set it as a UTC time and show the users current local version
			date = new Date(prepareDateTime(utcDateTime) + " UTC");
		}
		return date;
	}

	function getPrice(event) {
		const min = event.min_ticket_price / 100;
		const max = event.max_ticket_price / 100;
		let priceText = "";
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
			const head = document.head || document.getElementsByTagName("head")[0],
				style = document.createElement("style");
			style.type = "text/css";
			style.appendChild(document.createTextNode(window.atob(context.params.style)));
			head.appendChild(style);
		}
		if (!events) {
			events = context.events;
		}
		const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let target = context.params.target;
		const regexp = /^[^a-zA-Z]/;
		target = regexp.test(target) ? target : `#${target}`;
		const parent = document.querySelector(target);

		events.data.forEach(event => {
			const eventDate = parseLocalizedDateTime(event.localized_times.event_start, event.event_start);
			const doorTime = parseLocalizedDateTime(event.localized_times.door_time || event.localized_times.event_start, event.door_time || event.event_start);
			const priceText = getPrice(event);

			const row = document.createElement("a");
			row.setAttribute("href", `${context.params.baseUrl}events/${event.id}`);
			row.setAttribute("target", "_blank");

			const eventModuleContainer = document.createElement("div");
			eventModuleContainer.className = "bn-event-container";
			row.appendChild(eventModuleContainer);

			const eventModuleImageContainer = document.createElement("div");
			eventModuleImageContainer.className = "bn-event-image";
			eventModuleContainer.appendChild(eventModuleImageContainer);

			const eventModuleDate = document.createElement("h3");
			eventModuleDate.className = "bn-event-date";
			const eventDateFormatted = `${days[eventDate.getDay()]} ${months[eventDate.getMonth()]} ${eventDate.getDate()} ${eventDate.getFullYear()}`;
			eventModuleDate.innerText = eventDateFormatted;
			eventModuleImageContainer.appendChild(eventModuleDate);

			if (event.promo_image_url) {
				const eventModuleImage = document.createElement("img");
				eventModuleImage.setAttribute("src", event.promo_image_url);
				eventModuleImage.setAttribute("alt", "event");
				eventModuleImageContainer.appendChild(eventModuleImage);
			}

			const eventModuleTextContainer = document.createElement("div");
			eventModuleTextContainer.className = "bn-event-text";
			eventModuleContainer.append(eventModuleTextContainer);

			const eventModuleDateMobile = document.createElement("h3");
			eventModuleDateMobile.className = "bn-event-date-mobile";
			eventModuleDateMobile.innerText = eventDateFormatted;
			eventModuleTextContainer.appendChild(eventModuleDateMobile);

			const eventModuleArtists = document.createElement("h2");
			eventModuleArtists.className = "bn-event-artists";
			eventModuleArtists.innerText = event.name;
			eventModuleTextContainer.appendChild(eventModuleArtists);

			const eventModuleTime = document.createElement("p");
			eventModuleTime.className = "bn-event-time";
			eventModuleTime.innerText = formatAMPM(doorTime);
			eventModuleTextContainer.appendChild(eventModuleTime);

			const eventModuleButtonContainer = document.createElement("div");
			eventModuleButtonContainer.className = "bn-event-button";
			eventModuleContainer.appendChild(eventModuleButtonContainer);

			const eventModuleButton = document.createElement("button");
			eventModuleButton.className = "bn-buy-button bn-buy-button-module";
			eventModuleButton.id = `bigneon-buy-button-${event.id}`;
			eventModuleButton.innerText = "Tickets";
			eventModuleButtonContainer.appendChild(eventModuleButton);

			const eventModulePrice = document.createElement("p");
			eventModulePrice.className = "bn-event-price";
			eventModulePrice.innerText = priceText;
			eventModuleButtonContainer.appendChild(eventModulePrice);

			parent.appendChild(row);
		});

	};
	context.fetch();

})(BigNeonWidget);
