window.addEventListener("DOMContentLoaded", function cookieWindow() {
	// Check for cookie preferences
	if (query.get("cookies", "maybe") == "no") {
		cookiesAllowed = false;
		return;
	}
	if (cookies.allowCookies == "true") {
		cookiesAllowed = true;
		return;
	}
	// Make window
	var e = document.createElement("cookie-window")
	e.innerHTML = "<h4><span>&#x1F36A;</span> Cookies</h4><p>So apparently we're required to pop up an annoying message box to tell you that <b>this website uses cookies</b>. But we only use cookies for two things:</p>"+
		"<ol><li>Remembering that you're logged in</li><li>Remembering your cookie preferences</li></ol><p style='margin-bottom: 0;'>Cookies are required for logging in.</p>"+
		"<div class='buttons'><button onclick='cookiesAllowed = true; cookies.allowCookies = \"true\"; event.target.parentNode.parentNode.remove();'>Sure</button>"+
		"<button onclick='event.target.parentNode.parentNode.classList.add(\"inactive\"); setTimeout(() => location.replace(\"?cookies=no\"), 1000)'>Nope</button></div>"
	document.body.appendChild(e)
	// Styles
	var style = document.createElement("style")
	style.innerText = `
cookie-window {
	position: absolute;
	bottom: 0;
	right: 0;
	margin: 1em;
	border: 1px solid black;
	padding: 1em;
	border-radius: 1em;
	background: #00ff80;
	width: 50vw;
	max-width: 20em;
	font-family: sans-serif;
}
cookie-window h4 { margin: 0; }
cookie-window ol { padding-left: 1em; margin-bottom: 0; }
cookie-window .buttons {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	flex-wrap: wrap;
	height: 4.5em;
}
cookie-window button {
	font-size: 1em;
	margin: 1em 0.5em;
	padding: 1em;
	border: 1px solid black;
	border-radius: 1em;
	color: black;
	text-decoration: none;
	background: #03fccf;
}

cookie-window::after {
	content: "Bye";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	/* Specific styles */
	border-radius: inherit;
	opacity: 0;
	background: inherit;
	transition: opacity 0.1s ease-in-out;
}
cookie-window.inactive::after {
	height: 100%;
	opacity: 1;
}
cookie-window.inactive {
	transition: bottom 0.5s ease-in-out;
	transition-delay: 0.5s;
	bottom: -20em;
}
`
	document.head.appendChild(style)
});


var cookiesAllowed = false;

const cookies = (() => {
	/** @type {Object<string, string>} */
	var cookies = {}
	var c = document.cookie.split(";")
	if (! (c.length == 0 && c[0].trim().length == 0)) { // make sure there is at least one cookie
		// Parse cookie list
		for (var cookie of c) {
			var key = cookie.split("=")[0].trim()
			var value = cookie.split("=").slice(1).join("=").trim()
			cookies[key] = value
		}
	}
	return new Proxy(cookies, {
		/** @type {(target: any, name: string) => string | undefined} */
		get: (target, name) => {
			if (Object.keys(cookies).includes(name)) {
				return cookies[name]
			}
			return undefined
		},
		/** @type {(target: any, name: string, newValue: string) => boolean} */
		set: (target, name, newValue) => {
			cookies[name] = newValue
			if (cookiesAllowed) document.cookie = `${name}=${newValue};path=/`
			else console.warn(`NOT setting the cookie: ${name}=${newValue} because cookies are disabled`)
			return true;
		},
		/** @type {(target: any, name: string) => boolean} */
		deleteProperty: (target, name) => {
			delete cookies[name]
			if (cookiesAllowed) document.cookie = `${name}=;path=/;Max-Age=-99999999`;
			else console.warn(`NOT deleting the cookie: ${name} because cookies are disabled`)
			return true;
		},
		/** @type {(target: any) => string[]} */
		ownKeys: (target) => {
			return Object.keys(cookies)
		},
		/** @type {(target: any, name: string) => PropertyDescriptor | undefined} */
		getOwnPropertyDescriptor: (target, name) => {
			if (Object.keys(cookies).includes(name)) {
				return {
					value: cookies[name],
					writable: true,
					enumerable: true,
					configurable: true
				};
			} else return undefined
		}
	})
})();
