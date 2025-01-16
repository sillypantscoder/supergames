if (query.get("physics", "") == "1") {
	(() => {
		/**
		 * MatterJS class definitions.
		 * @typedef {{ world: MatterComposite }} MatterEngine
		 * @typedef {{ position: { x: number, y: number }, angle: number }} MatterBody
		 * @typedef {{ }} MatterComposite
		 * @typedef {{ }} MatterConstraint
		 * MatterJS module definitions.
		 * @typedef {{ create: () => MatterEngine, update: (engine: MatterEngine) => void }} MatterEngineModule
		 * @typedef {{ rectangle: (x: number, y: number, w: number, h: number, options: Object) => MatterBody }} MatterBodiesModule
		 * @typedef {{ setPosition: (body: MatterBody, pos: { x: number, y: number }) => void }} MatterBodyModule
		 * @typedef {{ add: (composite: MatterComposite, bodies: MatterBody | (MatterBody | MatterConstraint)[]) => void }} MatterCompositeModule
		 * @typedef {{ create: (engine: MatterEngine, options: Object) => MatterConstraint }} MatterMouseConstraintModule
		 * MatterJS
		 * @type {{ Engine: MatterEngineModule, Bodies: MatterBodiesModule, Body: MatterBodyModule, Composite: MatterCompositeModule, MouseConstraint: MatterMouseConstraintModule }}
		 */
		// @ts-ignore
		const Matter = window.Matter;

		var engine = Matter.Engine.create();
		/**
		 * @type {{ body: any; elem: any; parent: any; render(): void; }[]}
		 */
		var boxes = [];

		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} w
		 * @param {number} h
		 * @param {boolean} canMove
		 */
		function addRect(x, y, w, h, canMove) {
			var rect = Matter.Bodies.rectangle(x + (w / 2), y + (h / 2), w, h, {
				isStatic: !canMove
			})
			return rect
		}

		/**
		 * @param {HTMLElement} elm
		 */
		function addElement(elm) {
			var prevStyle = elm.getAttribute("style")
			elm.setAttribute("style", prevStyle + " ; display: inline-block;")
			var rect = elm.getBoundingClientRect();
			elm.setAttribute("style", prevStyle + "")
			const box = {
				body: addRect(rect.left, rect.top, rect.width, rect.height, true),
				elem: elm,
				parent: elm.parentNode ?? document.body,
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
			[...document.querySelectorAll("h1, h2, li, .tabs > * > *, #buttons > a, td, th, .physics")]
				.map((v) => (v instanceof HTMLElement) ? v : console.log("not an htmlelement", v))
				.filter((v) => v != undefined)
				.forEach(addElement)
			boxes.forEach((e) => {
				// prepare boxes for movement
				e.elem.setAttribute("style", e.elem.getAttribute("style") + " ; margin: 0; /*pointer-events: none;*/ position: absolute; display: inline-block;")
				e.elem.setAttribute("draggable", "false")
			})
			;(() => {
				var e = document.createElement("style")
				e.innerText = "body { margin: 0; overflow: hidden; touch-action: none; } .tabs > a.tab { height: 2em; } * { user-select: none; white-space: nowrap; } .tabs { border: none; }"
				document.head.appendChild(e)
			})();
		}, 1000)

		const ground = addRect(
			0, window.innerHeight, window.innerWidth, 100, false
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
			requestAnimationFrame(rerender);
		})();
		;(() => {
			var e = document.createElement("style")
			e.innerText = "html, body { height: 100%; margin: 0; }"
			document.head.appendChild(e)
		})();
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
	})();
}