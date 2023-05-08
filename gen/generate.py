import json

f = open("badges.csv", "r")
d = [x.split(",") for x in f.read().split("\n")]
f.close()

obj = {}
for line in d[1:]:
	obj[line[0]] = [int(x) for x in line[1:-2]]
	obj[line[0]].append(line[-2])

f = open("../public_files/badge_values.json", "w")
f.write(json.dumps(obj, indent='\t'))
f.close()

f = open("../public_files/data.json", "r")
d = json.loads(f.read())
f.close()

event_names = [*obj.keys()]
for n in event_names:
	if n not in d.keys():
		d[n] = []

f = open("../public_files/data.json", "w")
f.write(json.dumps(d, indent='\t'))
f.close()