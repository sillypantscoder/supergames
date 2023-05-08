if (location.search == "?physics") {
	window.engine = Matter.Engine.create();
	var boxes = [];

	function addRect(x, y, w, h, canMove) {
		var rect = Matter.Bodies.rectangle(x + (w / 2), y + (h / 2), w, h, {
			isStatic: !canMove
		})
		return rect
	}

	function addElement(elm) {
		var prevStyle = elm.getAttribute("style")
		console.log(prevStyle)
		elm.setAttribute("style", prevStyle + " ; display: inline-block; margin: 0;")
		var rect = elm.getBoundingClientRect();
		elm.setAttribute("style", prevStyle + " ; pointer-events: none;")
		const box = {
			body: addRect(rect.left, rect.top, rect.width, rect.height, true),
			elem: elm,
			parent: elm.parentNode,
			render() {
				if (!this.elem.isConnected) {
					Matter.Body.setPosition(this.body, { x: window.innerWidth / 2, y: window.innerHeight / -3 })
					this.parent.appendChild(this.elem)
				}
				const {x, y} = this.body.position;
				this.elem.style.top = `${y - (rect.height * 0.5)}px`;
				this.elem.style.left = `${x - (rect.width * 0.5)}px`;
				this.elem.style.transform = `rotate(${this.body.angle}rad)`;
				if (y > window.innerHeight * 1.5) this.elem.remove()
			},
		};
		boxes.push(box)
		Matter.Composite.add(engine.world, box.body);
	}
	setTimeout(() => {
		document.querySelectorAll("h1, h2, li, .tabs > *, #buttons > a, td, th, .physics").forEach(addElement)
		boxes.forEach((e) => e.elem.setAttribute("style", e.elem.getAttribute("style") + " ; margin: 0; pointer-events: none; position: absolute; display: inline-block;"))
		;(() => {
			var e = document.createElement("style")
			e.innerText = "body { margin: 0; overflow: hidden; touch-action: none; } .tabs > a.tab { height: 2em; } * { user-select: none; white-space: nowrap; } .tabs { border: none; }"
			document.head.appendChild(e)
		})();
	}, 1000)

	const ground = addRect(
		0, window.innerHeight, window.innerWidth * 2, 100, false
	);
	const leftWall = addRect(
		-100, 0, 100, window.innerHeight, false
	);
	const rightWall = addRect(
		window.innerWidth, 0, 100, window.innerHeight, false
	);

	const mouseConstraint = Matter.MouseConstraint.create(
		engine, {element: document.body}
	);
	Matter.Composite.add(
		engine.world, [ground, leftWall, rightWall, mouseConstraint]
	);
	(function rerender() {
		boxes.forEach((e) => e.render())
		Matter.Engine.update(engine);
		window.scrollLeft = 0
		requestAnimationFrame(rerender);
	})();
	;(() => {
		var e = document.createElement("style")
		e.innerText = "html, body { height: 100%; margin: 0; }"
		document.head.appendChild(e)
	})();
}
// */

/*
Matter.Pairs.clear(engine.pairs)
var render = Matter.Render.create({
    element: document.body,
	engine: engine,
	options: {
		width: 1000,
		height: 1000
	}
});
Matter.Render.run(render);
var e = document.createElement("style")
e.innerText = "canvas { position: absolute; top: 0; left: 0; background: transparent !important; }"
document.head.appendChild(e)
*/