/** @type {number} */
var formID = Number(expect("script[data-formid]").dataset.formid) ?? "[Invalid]"
/** @type {string} */
var formName = expect("script[data-formname]").dataset.formname ?? "[Invalid]"

/**
 * Form type definitions.
 * @typedef {{ "type": "multiplechoice", "title": string, "options": string[] }} MultipleChoiceQuestion
 * @typedef {{ "type": "text", "title": string }} TextQuestion
 * @typedef {MultipleChoiceQuestion | TextQuestion} Question
 * @typedef {{ user: string, results: any[] }} FormResponse
 */

sgtabs.extra(7, "Form: " + formName);

getData().then((info) => {
	sgtabs.userfix(info);
	// Download Forms
	var x = new XMLHttpRequest()
	x.open("GET", "/forms.json" + location.search)
	x.addEventListener("loadend", () => {
		var formList = JSON.parse(x.responseText)
		var form = formList[formID]
		var questions = form.questions
		addQuestions(questions)
		if (info.profile == null) {
			location.replace("/login.html")
			return;
		}
		if (info.profile.admin) {
			addResponseBoard(form.responses)
		}
	})
	x.send()
})
/** @type {FormInput[]} */
var pageQuestions = []
/**
 * @param {Question[]} questions
 */
function addQuestions(questions) {
	for (var i = 0; i < questions.length; i++) {
		// Add the question element
		/** @type {FormInput | null} */
		var data = null
		var q = questions[i]
		if (q.type == "multiplechoice") data = new MultipleChoiceFormInput(q)
		if (q.type == "text") data = new TextFormInput(q)
		if (data == null) throw new Error("Could not generate question data for type: " + q.type)
		expect("#questions").appendChild(data.elm)
		pageQuestions.push(data)
	}
}
function submit() {
	var results = []
	for (var i = 0; i < pageQuestions.length; i++) {
		var result = pageQuestions[i].getResult();
		results.push(result)
	}
	var x = new XMLHttpRequest()
	x.open("POST", "/submit_form")
	x.addEventListener("loadend", (e) => {
		location.replace("/forms/list.html" + location.search)
	})
	x.send(JSON.stringify({
		user: query.get("user", ""),
		id: formID,
		results
	}))
}
/**
 * @param {FormResponse[]} responses
 */
function addResponseBoard(responses) {
	for (var res = 0; res < responses.length; res++) {
		var response = responses[res]
		var e = document.createElement("button")
		e.innerText = `Response from ${response.user}`
		e.addEventListener("click", ((response, responseIndex) => (() => {
			fillResponse(response, responseIndex)
		}))(response, res))
		expect("#responses").appendChild(e)
	}
}
/**
 * @param {FormResponse} response
 * @param {number} responseIndex
 */
function fillResponse(response, responseIndex) {
	// Add Delete Button
	expect("#endbtn").innerText = "Delete Response"
	expect("#endbtn").removeAttribute("onclick")
	expect("#endbtn").addEventListener("click", () => {
		var x = new XMLHttpRequest()
		x.open("POST", "/delete_submission")
		x.addEventListener("loadend", (e) => {
			location.reload()
		})
		x.send(query.get("user", "") + "\n" + formID + "\n" + responseIndex)
	})
	// Add Cancel Button
	expect("#cancelbtn").removeAttribute("style")
	// Add Header
	var header = document.createElement("button")
	expect("#cancelbtn").insertAdjacentElement("beforeend", header)
	header.innerHTML = `Response by: ${response.user}`
	header.setAttribute("onclick", `location.assign("/profile/${response.user}${location.search}")`)
	// Fill Responses
	for (var i = 0; i < response.results.length; i++) {
		var result = response.results[i]
		var object = pageQuestions[i]
		object.fillResponse(result)
	}
	[...document.querySelectorAll("#responses > *")].forEach((e) => e.remove())
}
