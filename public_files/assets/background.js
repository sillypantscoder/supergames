(() => {
	// Create a canvas
	var c = document.createElement("canvas")
	c.width = 50
	c.height = 50
	// Get the rendering context
	var ctx = c.getContext("2d");
	if (ctx == null) throw new Error("canvas context is missing (background)")
	// Create image data
	var data = ctx.createImageData(50, 50);
	var pixels = data.data
	// Loop through all the pixels
	var x = 0;
	var y = 0;
	for (var r = 0; r < pixels.length; r += 4) {
		var g = r + 1
		var b = r + 2
		var a = r + 3
		// Add border
		if (y <= 1 || x <= 1) {
			pixels[r] = 0
			pixels[g] = 0
			pixels[b] = 0
			pixels[a] = 30
		} else {
			pixels[r] = 0
			pixels[g] = 0
			pixels[b] = 0
			pixels[a] = 0
		}
		// update
		x += 1;
		if (x >= 50) {
			x = 0;
			y += 1;
		}
	}
	// Save image data
	ctx.putImageData(data, 0, 0)
	// Convert to stylesheet
	var url = c.toDataURL()
	var e = document.createElement("style")
	e.innerText = `body {
		background: url(${url}) repeat center, linear-gradient(180deg, #44e494 0%, #3bb0b7 100%) no-repeat, linear-gradient(0deg, #3bb0b7 0%, #3bb0b7 100%) repeat;
	}`
	document.head.appendChild(e)
})();