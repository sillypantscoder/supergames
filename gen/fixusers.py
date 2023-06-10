import json
import datetime

f = open("../public_files/users.json", "r")
userlist = json.loads(f.read())
f.close()

f = open("../public_files/data.json")
data = json.loads(f.read())
f.close()

date = datetime.datetime.now()
dateinfo = f"{date.year}-{date.month}-{date.day}"
for eventname in data.keys():
	eventdata = data[eventname]
	for entry in eventdata:
		if entry[0] not in userlist:
			userlist.append({
				"name": entry[0],
				"date": dateinfo,
				"email": input("Enter email for " + entry[0] + " =>")
			})

f = open("../public_files/users.json", "w")
f.write(json.dumps(userlist, indent='\t'))
f.close()