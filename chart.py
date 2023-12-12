import math
import sys
import json

def getColors():
	patterns = [a+b+c for a in "08F" for b in "08F" for c in "08F"][1:]
	patterns = [a for b in patterns for a in [
		b[0] + b[1] + b[2],
		b[1] + b[0] + b[2],
		b[1] + b[2] + b[0]
	]]
	print(patterns)
getColors()

def generateBarChart(data: dict[str, int]):
	colors = [
		"F00", "0F0", "00F",
		"0FF", "F0F", "FF0",
		"000", "888",
		"800", "080", "008",
		"088", "808", "880",
		"8F0", "F80", "F08"
		"80F", "08F", "0F8"
	]
	usernames = [*data.keys()]
	usernames.sort(key=lambda x: -data[x])
	colwidth = (len(usernames) + 1) * 10
	r = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {colwidth * 2} {(len(usernames) + 2) * 10}"><!--<rect x="0" y="0" width="{colwidth * 2}" height="{(len(usernames) + 2) * 10}" fill="orange" />--><g>'
	for i in range(len(usernames)):
		r += f'<g><rect x="10" y="{1 + i}0" width="10" height="10" fill="#{colors[i]}" /><text x="25" y="{2 + i}0" font-size="10">{usernames[i]}</text></g>'
	maxh = max([data[u] for u in usernames])
	r += f'</g><g><text font-size="4" x="{(len(usernames) + 1) * 10}" y="{((len(usernames) + 1) * 10) + 4}">0</text><text font-size="4" x="{(len(usernames) + 1) * 10}" y="8">{maxh}</text></g><g>'
	barm = ((len(usernames) - 0) * 10) / maxh
	for i in range(len(usernames)):
		barv = data[usernames[i]] * barm
		r += f'<g><rect x="{(len(usernames) + i + 1) * 10}" y="{((len(usernames) + 1) * 10) - barv}" width="10" height="{barv}" fill="#{colors[i]}" /></g>'
	r += '</g></svg>'
	return r

def generateBar2Chart(data: dict[str, int]):
	colors = [
		"F00", "0F0", "00F",
		"0FF", "F0F", "FF0",
	#	"000", "888", "FFF",
		"800", "080", "008",
		"088", "808", "880",
		"8F0", "F80", "F08"
		"80F", "08F", "0F8"
	]
	usernames = [*data.keys()]
	usernames.sort(key=lambda x: -data[x])
	img_size = len(usernames) * 20
	maxh = max([data[u] for u in usernames])
	barm = (img_size - 9) / maxh
	r = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 {img_size + 10} {img_size + 10}"><g>'
	mark_amt = maxh / 10
	for i in range(11):
		markt = str(int(mark_amt * i))
		marky = (img_size - 9) - (((img_size - 9) / 10) * i)
		r += f'<g><text x="{-1 * len(markt)}" y="{marky + 1}" font-size="2">{markt}</text><line x1="0" y1="{marky}" x2="{img_size}" y2="{marky}" stroke="gray" stroke-width="0.5" /></g>'
	r += '</g><g>'
	for i in range(len(usernames)):
		r += f'<g><text x="{i * 20}" y="{img_size - 3}" font-size="3">{usernames[i]}</text>'
		barv = data[usernames[i]] * barm
		r += f'<rect x="{i * 20}" y="{(img_size - 9) - barv}" width="20" height="{barv}" fill="#{colors[i]}" /></g>'
	r += '</g></svg>'
	return r

def movePoint(X: float, Y: float, angle: float, distance: float) -> tuple[float, float]:
	# 0 degrees = North, 90 = East, 180 = South, 270 = West
	dY = distance*math.cos(math.radians(angle+180))
	dX = distance*math.sin(math.radians(angle+180))
	Xfinal = X + dX
	Yfinal = Y + dY
	return Xfinal, Yfinal

def generatePieChart(data: dict[str, int]):
	colors = [
		"F00", "0F0", "00F",
		"0FF", "F0F", "FF0",
	#	"000", "888", "FFF",
		"800", "080", "008",
		"088", "808", "880",
		"8F0", "F80", "F08"
		"80F", "08F", "0F8"
	]
	usernames = [*data.keys()]
	usernames.sort(key=lambda x: -data[x])
	img_size = 100
	total_points = sum([data[u] for u in usernames])
	r = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 {(img_size * 2) + 10} {img_size + 10}"><g>'
	for i in range(len(usernames)):
		pc = round((data[usernames[i]] / total_points) * 100 * 100) / 100
		pc = int(pc) if int(pc)==pc else pc
		r += f'<g><rect x="10" y="{1 + i}0" width="10" height="10" fill="#{colors[i]}" /><text x="25" y="{(i + 1.8) * 10}" font-size="10">{usernames[i]} ({pc}%)</text></g>'
	r += '</g><g>'
	deg_per_point = 360 / total_points
	cum_deg = 0
	point_center = [img_size * 1.5, img_size * 0.5]
	prev_point = movePoint(point_center[0], point_center[1], 0, img_size * 0.4)
	for i in range(len(usernames)):
		deg_amt = deg_per_point * data[usernames[i]]
		deg_dist = [deg_amt, img_size * 0.4]
		deg_dist[0] += cum_deg
		new_point = movePoint(point_center[0], point_center[1], *deg_dist)
		r += f'<g><path d="M {point_center[0]} {point_center[1]} L {prev_point[0]} {prev_point[1]} A 40 40 0 {1 if deg_amt > 180 else 0} 0 {new_point[0]} {new_point[1]} Z" fill="#{colors[i]}" /></g>'
		prev_point = [*new_point]
		cum_deg = deg_dist[0]
	r += '</g></svg>'
	return r

def main():
	data = json.loads(sys.argv[1])
	# { type: str, data: dict[str, int] }
	chartType = {
		"bar": generateBar2Chart,
		"pie": generatePieChart
	}[data["type"]]
	chart = chartType(data["data"])
	f = open("chart.svg", "w")
	f.write(chart)
	f.close()

if __name__ == "__main__":
	main()
