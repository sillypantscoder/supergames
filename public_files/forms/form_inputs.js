class FormInput {
	constructor() {
		this.elm = document.createElement("div")
		this.elm.classList.add("card")
	}
	/**
	 * @returns {any}
	 */
	getResult() {
		return null;
	}
	/**
	 * @param {any} data
	 */
	fillResponse(data) {}
}
class TextFormInput extends FormInput {
	/** @param {TextQuestion} question */
	constructor(question) {
		super()
		this.elm.appendChild(document.createElement("div"))
		this.elm.children[0].classList.add("title")
		this.elm.children[0].textContent = question.title
		this.elm.appendChild(document.createElement("div"))
		this.textarea = this.elm.children[1].appendChild(document.createElement("textarea"))
		this.textarea.setAttribute("style", "width: 60em; height: 30em;")
	}
	getResult() {
		return this.textarea.value
	}
	/**
	 * @param {string} data
	 */
	fillResponse(data) {
		this.textarea.value = data
	}
}
class MultipleChoiceFormInput extends FormInput {
	/** @param {MultipleChoiceQuestion} question */
	constructor(question) {
		super()
		// Add title
		this.elm.appendChild(document.createElement("div"))
		this.elm.children[0].classList.add("title")
		this.elm.children[0].textContent = question.title
		// Add radio buttons
		this.elm.appendChild(document.createElement("div"))
		var radioname = question.title.replaceAll(" ", "_").replaceAll(/[^A-Za-z_]/ig, "")
		for (var i = 0; i < question.options.length; i++) {
			var rw = document.createElement("div")
			this.elm.children[1].append(rw)
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
	}
	getResult() {
		var checkedBox = this.elm.children[1].querySelector("div:has( > input:checked)")
		if (checkedBox == null) throw new Error("You need to select a radio button")
		var i = [...this.elm.children[1].children].indexOf(checkedBox)
		return i
	}
	/**
	 * @param {number} data
	 */
	fillResponse(data) {
		if (data != -1) {
			var rw = this.elm.children[1].children[data]
			rw.children[0].setAttribute("checked", "")
		}
	}
}