var tabs_default = [
	'<a class="tab" href="/list.html">Leaderboard List</a>',
	'<a class="tab" href="/badges.html">Badges</a>',
	'<a class="tab" href="/badge_leaderboard.html">Badge Leaderboard</a>',
	'<a class="tab" href="/meta.html">Meta</a>',
	'<a class="tab" href="/activity_leaderboard.html">Activity Leaderboard</a>'
]
function beginTabs() {
	var e = document.createElement("div")
	e.classList.add("tabwrapcontainer")
	document.querySelector(".tabs").appendChild(e)
}
function addTab(t) {
	var e = document.createElement("div")
	e.innerHTML = t
	var elm = e.children[0]
	document.querySelector(".tabwrapcontainer").appendChild(elm)
	return elm
}
tabs = () => {
	beginTabs()
	for (var i = 0; i < tabs_default.length; i++) {
		if (i == 0) {
			addTab('<a href="/"><img src="/logo.png"></a>')
			addTab('<a class="tab" id="sites-tab" href="https://sites.google.com/svvsd.org/supergames/home">Google Sites Home</a>')
		}
		var elm = addTab(tabs_default[i])
		if (tabs_default[i].match(/href="([\/a-z_\.]+)"/)[1] == location.pathname) {
			elm.removeAttribute("href")
			elm.classList.add("selected")
		}
	}
};
tabs.extra = (tabi, tabname) => {
	beginTabs()
	for (var i = 0; i < tabs_default.length; i++) {
		if (i == 0) {
			addTab('<a href="/"><img src="/logo.png"></a>')
			addTab('<a class="tab" id="sites-tab" href="https://sites.google.com/svvsd.org/supergames/home">Google Sites Home</a>')
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