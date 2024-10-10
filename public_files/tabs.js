var tabs_default = [
	`<a class="tab" href="/login.html${location.search}" id="login-tab"><b>Login</b></a>`,
	`<a class="tab" href="/leaderboards/list.html${location.search}">Leaderboard List</a>`,
	`<a class="tab" href="/badges.html${location.search}">Badges</a>`,
	`<a class="tab" href="/badge_leaderboard/badge_leaderboard.html${location.search}">Badge Leaderboard</a>`,
	`<a class="tab" href="/meta/meta.html${location.search}">Meta</a>`,
	`<a class="tab" href="/activity/activity_leaderboard.html${location.search}">Activity Leaderboard</a>`,
	`<a class="tab" href="/form_list.html${location.search}">Forms</a>`,
	`<a class="tab" href="/entrysubmit.html${location.search}">Submit entries</a>`
];
const sgtabs = (() => {
	var container = document.createElement("div")
	container.classList.add("tabwrapcontainer")
	expect(".tabs").appendChild(container)
	/**
	 * @param {string} t
	 */
	function addTab(t) {
		var e = document.createElement("div")
		e.innerHTML = t
		var elm = e.children[0]
		container.appendChild(elm)
		return elm
	}
	var tabs = () => {
		for (var i = 0; i < tabs_default.length; i++) {
			if (i == 0) {
				addTab(`<a href="/${location.search}"><img src="/logo.png"></a>`)
			}
			var elm = addTab(tabs_default[i])
			var currentTabCheck = tabs_default[i].match(/href="([\/a-z_\.]+)(\?[0-9]*)?"/)
			if (currentTabCheck && currentTabCheck[1] == location.pathname) {
				elm.removeAttribute("href")
				elm.classList.add("selected")
			}
		}
	};
	tabs.extra = (/** @type {number} */ tabi, /** @type {string} */ tabname) => {
		for (var i = 0; i < tabs_default.length; i++) {
			if (i == 0) {
				addTab(`<a href="/${location.search}"><img src="/logo.png"></a>`)
			}
			if (i == tabi) {
				addTab('<a class="tab selected">' + tabname + '</a>')
			}
			addTab(tabs_default[i])
		}
		if (i == tabi) {
			addTab('<a class="tab selected">' + tabname + '</a>')
		}
	};
	tabs.userfix = (/** @type {SGData} */ data) => {
		if (data.profile == null) {
			var selfElm = document.querySelector("#self")
			if (selfElm) {
				selfElm.remove()
			}
			return
		}
		var profile = data.profile
		// We are logged in
		expect("#login-tab").innerText = "My Profile"
		expect("#login-tab").setAttribute("href", "/profile/" + profile.name + location.search)
		if (location.pathname == "/profile/" + encodeURIComponent(profile.name)) {
			expect("#login-tab").remove()
			// We are on our own profile page!
		}
	}
	return tabs
})();