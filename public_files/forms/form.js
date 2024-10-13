/** @type {number} */
var formID = Number(expect("script[data-formid]").dataset.formid) ?? "[Invalid]"
/** @type {string} */
var formName = expect("script[data-formname]").dataset.formname ?? "[Invalid]"

/**
 * Form type definitions.
 * @typedef {{ "type": "multiplechoice", "title": string, "options": string[] }} MultipleChoiceQuestion
 * @typedef {{ "type": "text", "title": string }} TextQuestion
 * @typedef {MultipleChoiceQuestion | TextQuestion} Question
 * @typedef {{ question: Question, element: HTMLElement, getResult: () => Promise<any>, fillResponse: (data: any) => void }} QuestionData
 * @typedef {{ user: string, results: any[] }} FormResponse
 */

sgtabs.extra(7, "Form: " + formName);

getData().then((info) => {
	sgtabs.userfix(info);
	// Download Forms
	var x = new XMLHttpRequest()
	x.open("GET", "/forms.json")
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
/** @type {QuestionData[]} */
var pageQuestions = []
/**
 * @param {Question[]} questions
 */
function addQuestions(questions) {
	for (var i = 0; i < questions.length; i++) {
		// Add the question element
		/** @type {QuestionData | null} */
		var data = null
		var q = questions[i]
		if (q.type == "multiplechoice") data = createMultipleChoiceQuestionElement(q)
		if (q.type == "text") data = createTextQuestionElement(q)
		if (data == null) throw new Error("Could not generate question data for type: " + q.type)
		expect("#questions").appendChild(data.element)
		pageQuestions.push(data)
	}
}
/**
 * @param {TextQuestion} question
 * @returns {QuestionData}
 */
function createTextQuestionElement(question) {
	var e = document.createElement("div")
	e.classList.add("card")
	e.appendChild(document.createElement("div"))
	e.children[0].classList.add("title")
	e.children[0].textContent = question.title
	e.appendChild(document.createElement("div"))
	var textarea = e.children[1].appendChild(document.createElement("textarea"))
	textarea.setAttribute("style", "width: 60em; height: 30em;")
	return {
		question,
		element: e,
		getResult: async function () {
			return textarea.value
		},
		fillResponse: (data) => {
			textarea.value = data
		}
	}
}
/**
 * @param {MultipleChoiceQuestion} question
 * @returns {QuestionData}
 */
function createMultipleChoiceQuestionElement(question) {
	var e = document.createElement("div")
	e.classList.add("card")
	e.appendChild(document.createElement("div"))
	e.children[0].classList.add("title")
	e.children[0].textContent = question.title
	e.appendChild(document.createElement("div"))
	var radioname = question.title.replaceAll(" ", "_").replaceAll(/[^A-Za-z_]/ig, "")
	for (var i = 0; i < question.options.length; i++) {
		var rw = document.createElement("div")
		e.children[1].append(rw)
		var r = document.createElement("input")
		r.setAttribute("type", "radio")
		r.setAttribute("name", radioname)
		r.setAttribute("value", i.toString())
		r.setAttribute("id", `multiplechoice_${radioname}_${i}`)
		rw.appendChild(r)
		var label = document.createElement("label")
		label.setAttribute("for", `multiplechoice_${radioname}_${i}`)
		label.innerText = question.options[i]
		rw.appendChild(label)
	}
	return {
		question,
		element: e,
		getResult: async function () {
			var elm = e.children[1].querySelector("div:has( > input:checked)")
			if (elm == null) throw new Error("You need to select a radio button")
			var i = [...e.children[1].children].indexOf(elm)
			return i
		},
		fillResponse: (data) => {
			if (data != -1) {
				var rw = e.children[1].children[data]
				rw.children[0].setAttribute("checked", "")
			}
		}
	}
}
async function submit() {
	var results = []
	for (var i = 0; i < pageQuestions.length; i++) {
		var func = pageQuestions[i].getResult;
		var result = await func();
		results.push(result)
	}
	var x = new XMLHttpRequest()
	x.open("POST", "/submit_form")
	x.addEventListener("loadend", (e) => {
		location.replace("/forms/list.html" + location.search)
	})
	x.send(JSON.stringify({
		user: location.search.substring(1),
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
		x.send(location.search.substring(1) + "\n" + formID + "\n" + responseIndex)
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
