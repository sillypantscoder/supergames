sgtabs.extra(3, "Admin Board")

getData().then((info) => {
	sgtabs.userfix(info);
	if (info.profile == null) return location.replace("/")
	if (info.profile.admin == false) return location.replace("/")
});
// APPLICATION VIEWER CODE
(() => {
	var x = new XMLHttpRequest()
	x.open("GET", "/applications.txt" + location.search)
	x.addEventListener("loadend", () => {
		var t = x.responseText
		var h = t.replaceAll(/(Username: ([A-Za-z0-9 \._]+)\nEmail address: ([A-Za-z0-9@\._]+)?\n)(?!\[(Rejected|Accepted)\])/ig,
			"$1<button onclick=\"createprofile('$2', '$3')\">Accept</button><button onclick=\"rejectprofile('$2', '$3')\">Reject</button>\n")
		h = h.replaceAll(/^\n*$/ig, "There are no applications at the moment.")
		if (h == t) h += "\nThere are no valid applications at the moment."
		expect("#applications").innerHTML = h
	})
	x.send()
})();
/**
 * @param {string} username
 * @param {string} email
 */
function createprofile(username, email) {
	var x = new XMLHttpRequest()
	x.open("POST", "/createuser/?user=" + query.get("user", "error"))
	x.addEventListener("loadend", () => location.reload())
	x.send(`${username}\n${email}`)
}
/**
 * @param {string} username
 * @param {string} email
 */
function rejectprofile(username, email) {
	var x = new XMLHttpRequest()
	x.open("POST", "/rejectprofile/?user=" + query.get("user", "error"))
	x.addEventListener("loadend", () => location.reload())
	x.send(`${username}\n${email}`)
}
// EVENT LIST CODE
/**
 * @param {string} data
 */
function uploadCSV(data) {
	var x = new XMLHttpRequest()
	x.open("POST", "/upload_csv")
	x.addEventListener("loadend", () => location.replace("/"))
	x.send(location.search.substring(1) + "\n" + data)
}
// Add a single event:
function addLeaderboard() {
	var isSpecialty = expectInput(expect("#specialty")).checked
	var data = {
		"name": expectInput(expect("#new-event-name")).value,
		"data": {
			"badges": isSpecialty ? [] :
				[...document.querySelectorAll(".badgev")].map((v) => expectInput(v).valueAsNumber),
			"badge_desc": isSpecialty ? "" : expectInput(expect("#desc-badge")).value,
			"leaderboard_desc": expectInput(expect("#desc-event")).value,
			"entries": [],
			"reverseOrder": expectSelect(expect("#bestscore")).value == "true",
			"isTime": expectInput(expect("#istime")).checked
		}
	}
	var x = new XMLHttpRequest()
	x.open("POST", "/add_event")
	x.send(JSON.stringify(data))
}