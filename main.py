from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
import datetime
import traceback
import subprocess
from urllib.parse import unquote
import random
import typing

hostName = "0.0.0.0"
serverPort = 12344

def read_file(filename: str) -> bytes:
	f = open(filename, "rb")
	t = f.read()
	f.close()
	return t

def write_file(filename: str, content: bytes):
	f = open(filename, "wb")
	f.write(content)
	f.close()

def log(importance: str, msg: str):
	f = open("log.txt", "a")
	f.write(datetime.datetime.now().isoformat())
	f.write(" - ")
	f.write(importance.center(5))
	f.write(" - ")
	f.write(msg.replace("\t", "\t\t\t\t\t\t\t\t\t\t"))
	f.write("\n")
	f.close()

def log_existence_check():
	if os.path.isfile("log.txt"):
		if b"-" not in read_file("log.txt"):
			os.remove("log.txt")

def multiply(s1: str, s2: str) -> int:
	i1 = list(s1.encode("UTF-8"))
	i2 = list(s2.encode("UTF-8"))
	f = [0, 0, 0, 0, 0]
	for startIndex in range(len(f)):
		xpos = startIndex + 0
		for i in range(len(i1)):
			f[xpos] += i1[i]
			xpos += 1
			if xpos >= len(f): xpos -= len(f)
	for startIndex in range(len(f)):
		xpos = startIndex + 0
		for i in range(len(i2)):
			f[xpos] += i2[i]
			xpos += 1
			if xpos >= len(f): xpos -= len(f)
	return (f[0] * 16) * (f[1] * 8) * (f[2] * 4) * (f[3] * 2) * (f[4] * 1)

class User(typing.TypedDict):
	name: str
	date: str
	email: str
	password: str
	admin: bool
	desc: str

def getUserFromID(userid: str) -> User | None:
	ou = json.loads(read_file("users.json"))
	for n in ou:
		uid = multiply(n["name"], n["password"])
		if str(uid) == userid:
			return n
	return None

def getPwdFromUser(name: str) -> str | None:
	ou = json.loads(read_file("users.json"))
	for n in ou:
		if name == n["name"]:
			return n["password"]
	return None

def getIDFromUser(name: str, pwd: str) -> str | None:
	ou = json.loads(read_file("users.json"))
	for n in ou:
		if name == n["name"] and pwd == n["password"]:
			return str(multiply(n["name"], n["password"]))
	return None

def generateDataFileFromTSV(tsv: str):
	log("TSV", "Starting!")
	# Load the TSV data
	d = [x.split("\t") for x in tsv.split("\n")[1:]]
	# Load the old data
	f = open("public_files/data.json", "r")
	data = json.loads(f.read())
	f.close()
	# Go through the TSV file and register the events
	newData = {}
	newentries: list[str] = []
	for line in d:
		if line[0] == "DONTREGISTER": continue
		newentries.append(line[0])
		newData[line[0]] = {
			"badges": [int(x) for x in line[1:-5]] if line[1] != '' else [],
			"badge_desc": line[-5],
			"leaderboard_desc": line[-4],
			"entries": [],
			"isTime": line[-2] == "Time",
			"reverseOrder": line[-3] == "Lowest"
		}
	# Go through the old data and see if there are any
	# leaderboards missing from the TSV file
	for name in data:
		if name not in newData.keys():
			log("TSV", f"Warning: Not in the TSV file: {name}")
			log("TSV", f"\tThere are {len(data[name]['entries'])} entries")
			log("TSV", "\tThe leaderboard is not being deleted")
			newData[name] = data[name]
		else:
			newData[name]["entries"] = data[name]["entries"]
			newentries.remove(name)
	# List of new leaderboards
	log("TSV", "New leaderboards:")
	for x in newentries: log("TSV", "\t" + x)
	# Save the data!
	f = open("public_files/data.json", "w")
	f.write(json.dumps(newData, indent='\t'))
	f.close()
	# Finish
	log("TSV", "Finished!")

class SafeDict:
	def __init__(self, fields: dict[str, str]):
		self.fields: dict[str, str] = fields
	def get(self, key: str, default: str = ''):
		if key in self.fields:
			return self.fields[key]
		else:
			return default
	@staticmethod
	def from_list(fields: list[tuple[str, str]]):
		f: dict[str, str] = {}
		for i in fields:
			f[i[0]] = i[1]
		return SafeDict(f)

class URLQuery(SafeDict):
	def __init__(self, q: str):
		fields: dict[str, str] = {}
		for f in q.split("&"):
			s = f.split("=")
			if len(s) >= 2:
				fields[s[0]] = s[1]
		super().__init__(fields)
		self.orig = q

class HTTPResponse(typing.TypedDict):
	status: int
	headers: dict[str, str]
	content: bytes

def get(path: str, query: URLQuery, headers: SafeDict) -> HTTPResponse:
	log_existence_check()
	user = getUserFromID(query.get("user"))
	if path == "/users.json":
		ou = json.loads(read_file("users.json"))
		for n in ou:
			del n["password"]
			del n["admin"]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "application.json"
			},
			"content": json.dumps(ou).encode("UTF-8")
		}
	elif os.path.isfile("public_files" + path):
		return {
			"status": 200,
			"headers": {
				"Content-Type": {
					"html": "text/html",
					"json": "application/json",
					"css": "text/css",
					"ico": "image/x-icon",
					"otf": "application/x-font-opentype",
					"jpeg": "image/jpeg",
					"png": "image/png",
					"js": "application/javascript",
					"txt": "text/plain",
					"xml": "image/svg+xml"
				}[path.split(".")[-1]]
			},
			"content": read_file("public_files" + path)
		}
	elif path == "/":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<!DOCTYPE html><html><head><script>//{random.random()}</script></head><body><script>location.replace('/home.html'+location.search);</script></body></html>".encode("UTF-8")
		}
	elif path.startswith("/leaderboards/"):
		name = path[14:]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("leaderboard.html").replace(b"{{NAME}}", name.replace("%20", " ").encode("UTF-8"))
		}
	elif path.startswith("/games/"):
		name = path[7:]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("game.html").replace(b"{{NAME}}", name.replace("%20", " ").encode("UTF-8"))
		}
	elif path.startswith("/badges/"):
		name = path.split("/")[2]
		rank = path.split("/")[3]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("badge.html")
				.replace(b"{{NAME}}", name.replace("%20", " ").encode("UTF-8"))
				.replace(b"{{RANK}}", rank.encode("UTF-8"))
				.replace(b"{{SRANK}}", ["Novice", "Vassal", "Apprentice", "Prospect", "Artisan", "Expert", "Master", "Ultimate Master"][int(rank)].encode("UTF-8"))
		}
	elif path.startswith("/profile/"):
		name = path.split("/")[2]
		userlist: list[str] = [x["name"] for x in json.loads(read_file("users.json"))]
		if name.isdigit() and int(name) - 1 < len(userlist):
			name = userlist[int(name) - 1]
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": read_file("profile.html").replace(b"{{NAME}}", name.replace("%20", " ").encode("UTF-8"))
			}
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("profile.html").replace(b"{{NAME}}", name.replace("%20", " ").encode("UTF-8"))
		}
	elif path.startswith("/forms/"):
		formid = path.split("/")[2]
		formlist: list[str] = [x["name"] for x in json.loads(read_file("forms.json"))]
		if formid.isdigit() and int(formid) < len(formlist):
			name = formlist[int(formid)]
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": read_file("form.html").replace(b"{{NAME}}", name.encode("UTF-8")).replace(b"{{FORMID}}", formid.encode("UTF-8"))
			}
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": b"<script>location.replace('/form_list.html')</script><body>That is not a valid form name, you will be redirected to the form list.</body>"
		}
	elif path == "/usercheck":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "application/json"
			},
			"content": (json.dumps([{"name": user["name"], "admin": user["admin"]}]) if user != None else "[]").encode("UTF-8")
		}
	elif path == "/user_id_create":
		u = query.get("username")
		p = query.get("pwd")
		userid = getIDFromUser(unquote(u), unquote(p))
		if userid == None:
			log("-", "Failed to sign in for user: " + u + " and password: " + p)
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": b"<script>location.replace('/login.html#invalid')</script>"
			}
		admin = False
		userData = getUserFromID(userid)
		if userData != None:
			admin = userData["admin"]
		log("#", "User '" + unquote(u) + ("' (admin)" if admin else "'") + " logged in!")
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<script>location.replace('/?user={userid}')</script>".encode("UTF-8")
		}
	elif path == "/user_id_create/sudo":
		newname = unquote(query.get("newUser"))
		if user == None: return {"status": 404, "headers": {}, "content": b""}
		if user["admin"]:
			newID = getIDFromUser(newname, getPwdFromUser(newname)) # type: ignore
			log("SECUR", "User " + repr(user["name"]) + " switch to " + repr(newname))
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": f"<script>location.replace('/profile/{newname}?user={newID}')</script>".encode("UTF-8")
			}
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"[Invalid admin credentials.]".encode("UTF-8")
		}
	elif path == "/applications.txt":
		if "?" not in path: return {
			"status": 404,
			"headers": {},
			"content": b"You must be signed in to access the applications list"
		}
		u = path.split("?")[1]
		user = getUserFromID(u)
		if user and user["admin"]:
			ou = read_file("applications.txt")
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/plain"
				},
				"content": ou
			}
		else:
			return {
				"status": 404,
				"headers": {},
				"content": b"You must be an admin to access the applications list"
			}
	elif path == "/forms.json":
		u = query.get("user")
		user = getUserFromID(u)
		ou = json.loads(read_file("forms.json"))
		if not (user and user["admin"]):
			for form in ou:
				del form["responses"]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/json"
			},
			"content": json.dumps(ou).encode("UTF-8")
		}
	elif path in ["/special/badges", "/special/meta", "/special/activity"]:
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("special.html")
		}
	elif path.startswith("/graph/"):
		event = unquote(path.split("/")[2])
		graph_type = path.split("/")[3]
		event_data = json.loads(read_file("public_files/data.json"))[event]["entries"]
		entries = {}
		for d in event_data:
			entries[d[0]] = d[1]
		data: dict[str, typing.Any] = {
			"type": graph_type,
			"data": entries
		}
		subprocess.run(["python3", "chart.py", json.dumps(data)], check=False)
		chart = read_file("chart.svg")
		return {
			"status": 200,
			"headers": {
				"Content-Type": "image/svg+xml"
			},
			"content": chart
		}
	elif path == "/apple-touch-icon.png":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "image/png"
			},
			"content": read_file("public_files/assetes/apple-touch-icon.png")
		}
	else: # 404 page
		log("", "404 encountered: " + path + "\n\t(Referrer: " + headers.get("Referer") + ")")
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": b"404 Page Not Found"
		}

def post(path: str, body: bytes) -> HTTPResponse:
	if path == "/addentry":
		update = "There was an error and no entries were updated."
		try:
			data = json.loads(read_file("public_files/data.json"))
			finished = False
			bodydata = body.decode("UTF-8").split("\n")
			eventname = bodydata[0]
			username = bodydata[1]
			score = bodydata[2]
			mode = bodydata[3]
			note = bodydata[4]
			if eventname in data:
				for d in data[eventname]["entries"]:
					if d[0] == username:
						# Update existing entry
						update = f"Updated entry\n\tevent: {eventname}\n\tuser: {username}\n\told score: {d[1]}\n\tnew score: {score}\n\tmode: {mode}\n\tnote: {note}"
						if mode == "add": d[1] += float(score)
						elif mode == "replace": d[1] = float(score)
						else: d[1] = max(d[1], float(score))
						d[2] = datetime.datetime.now().isoformat()
						d[3] = note
						update += f"\n\tregistered score: {d[1]}"
						finished = True
				if not finished:
					# Create new entry
					update = f"Created entry\n\tevent: {eventname}\n\tuser: {username}\n\tnew score: {score}\n\tnote: {note}"
					data[eventname]["entries"].append([username, float(score), datetime.datetime.now().isoformat(), note])
			else:
				update += f"\n\nERROR: Unknown event: {eventname}\nRequest data:\n\tuser: {username}\n\tscore: {score}\n\tmode: {mode}\n\tnote: {note}"
			write_file("public_files/data.json", json.dumps(data, indent='\t').encode("UTF-8"))
		except Exception as e:
			update += "\nError was:\n\n"
			update += ''.join(traceback.format_exception(type(e), e, e.__traceback__))
		log("E", "entryeditor: " + update)
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/plain"
			},
			"content": update.encode("UTF-8")
		}
	elif path == "/tryaddentry":
		bodydata = json.loads(body.decode("UTF-8"))
		forms = json.loads(read_file("public_files/entries.json"))
		forms.append(bodydata)
		write_file("public_files/entries.json", json.dumps(forms, indent='\t').encode("UTF-8"))
		# log("Tried to add an entry...\n\t" + repr(bodydata))
		return {
			"status": 200,
			"headers": {},
			"content": b"Entry was updated"
		}
	elif path == "/add_application":
		bodydata = body.decode("UTF-8").split("\n")
		c = read_file("applications.txt")
		c = f"""\n==========\nUsername: {bodydata[0]}\nEmail address: {bodydata[1]}\n==========\n\n\n""".encode("UTF-8") + c
		log("APPLC", f"create application (username={bodydata[0]}, email={bodydata[1]})")
		write_file("applications.txt", c)
		return {
			"status": 301,
			"headers": {},
			"content": b"Application was created"
		}
	elif path.startswith("/createuser/"):
		# Authenticate
		auth = path.split("/")[2]
		user = getUserFromID(auth)
		if user == None or user["admin"] == False:
			return {
				"status": 404,
				"headers": {},
				"content": b"The user is not correct (need to have admin permissions)"
			}
		# get data
		bodydata = body.decode("UTF-8").split("\n")
		# Update user list
		c = read_file("users.json").decode("UTF-8")
		now = datetime.datetime.now()
		date = f"{now.year}-{str(now.month).rjust(2, '0')}-{str(now.day).rjust(2, '0')}T{str(now.hour).rjust(2, '0')}:{str(now.minute).rjust(2, '0')}:{str(now.second).rjust(2, '0')}.{str(now.microsecond // 1000).rjust(3, '0')}"
		c = c[:-2] + f''',
	{{
		"name": {json.dumps(bodydata[0])},
		"date": "{date}",
		"email": {json.dumps(bodydata[1])},
		"password": {json.dumps(bodydata[0])},
		"admin": false,
		"desc": ""
	}}
]'''
		log("APPLC", "accept application for " + bodydata[0])
		write_file("users.json", c.encode("UTF-8"))
		# Update applications
		c = read_file("applications.txt").decode("UTF-8")
		c = c.replace(f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}", f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}\n[Accepted]")
		write_file("applications.txt", c.encode("UTF-8"))
		# Finish
		return {
			"status": 301,
			"headers": {},
			"content": b"Application was created"
		}
	elif path.startswith("/rejectprofile/"):
		# Authenticate
		auth = path.split("/")[2]
		user = getUserFromID(auth)
		if user == None or user["admin"] == False:
			return {
				"status": 404,
				"headers": {},
				"content": b"The user is not correct (need to have admin permissions)"
			}
		# data
		bodydata = body.decode("UTF-8").split("\n")
		# Update applications
		c = read_file("applications.txt").decode("UTF-8")
		c = c.replace(f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}", f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}\n[Rejected]")
		log("APPLC", "reject application for " + bodydata[0])
		write_file("applications.txt", c.encode("UTF-8"))
		# Finish
		return {
			"status": 301,
			"headers": {},
			"content": b"Rejected successfully"
		}
	elif path == "/setting/pwd":
		bodydata = body.decode("UTF-8").split("\n")
		ou = json.loads(read_file("users.json"))
		name = "<error>"
		for n in ou:
			if str(multiply(n["name"], n["password"])) == bodydata[0]:
				n["password"] = bodydata[1]
				name = n["name"]
		log("SECUR", f"{name} update pwd")
		write_file("users.json", json.dumps(ou, indent='\t').encode("UTF-8"))
		return {
			"status": 200,
			"headers": {},
			"content": b"Password updated successfully"
		}
	elif path == "/setting/desc":
		bodydata = body.decode("UTF-8").split("\n")
		ou = json.loads(read_file("users.json"))
		name = "<error>"
		desc_from = "<error>"
		newdesc = '\n'.join(bodydata[1:])
		for n in ou:
			if str(multiply(n["name"], n["password"])) == bodydata[0]:
				desc_from = n["desc"]
				n["desc"] = newdesc
				name = n["name"]
		log("SECUR", f"{name} update desc\n\tfrom: {repr(desc_from)}\n\tto: {repr(newdesc)}")
		write_file("users.json", json.dumps(ou, indent='\t').encode("UTF-8"))
		return {
			"status": 200,
			"headers": {},
			"content": b"Description updated successfully"
		}
	elif path == "/setting/change_name":
		bodydata = body.decode("UTF-8").split("\n")
		# Check permissions
		user = getUserFromID(bodydata[0])
		if user == None or user["admin"] == False:
			return {
				"status": 404,
				"headers": {},
				"content": b"The user is not correct (need to have admin permissions)"
			}
		# Get names
		oldName = bodydata[1]
		newName = bodydata[2]
		log("SECUR", f"Changing the name of a user. From: {repr(oldName)} To: {repr(newName)}")
		# Change entry in users.json
		f = open("users.json", "r")
		d = json.loads(f.read())
		f.close()
		for e in d:
			if e["name"] == oldName:
				e["name"] = newName
				log("SECUR", "\tChanged username in users.json")
		f = open("users.json", "w")
		f.write(json.dumps(d, indent='\t'))
		f.close()
		# Find entries in data.json and switch the user
		f = open("public_files/data.json", "r")
		d = json.loads(f.read())
		f.close()
		for eventname in d.keys():
			entries = d[eventname]["entries"]
			for itemno in range(len(entries)):
				if entries[itemno][0] == oldName:
					entries[itemno][0] = newName
					log("E", "\tChanged entry for event: " + eventname + " item #: " + str(itemno))
		f = open("public_files/data.json", "w")
		f.write(json.dumps(d, indent='\t'))
		f.close()
		# Return result
		return {
			"status": 200,
			"headers": {},
			"content": b"Name was changed successfully"
		}
	elif path == "/submit_form":
		bodydata = json.loads(body.decode("UTF-8"))
		forms = json.loads(read_file("forms.json"))
		name = getUserFromID(bodydata["user"])["name"] # type: ignore
		forms[bodydata["id"]]["responses"].append({
			"user": name,
			"results": bodydata["results"]
		})
		log("FORMS", f"{name} submit form {forms[bodydata['id']]['name']}: " + json.dumps(bodydata["results"], indent='\t'))
		write_file("forms.json", json.dumps(forms, indent='\t').encode("UTF-8"))
		return {
			"status": 200,
			"headers": {},
			"content": b"The submission has been recieved"
		}
	elif path == "/delete_submission":
		bodydata = body.decode("UTF-8").split("\n")
		if getUserFromID(bodydata[0])["admin"] == False: return { # type: ignore
			"status": 404,
			"headers": {},
			"content": b"You need admin permissions"
		}
		forms = json.loads(read_file("forms.json"))
		del forms[int(bodydata[1])]["responses"][int(bodydata[2])]
		write_file("forms.json", json.dumps(forms, indent='\t').encode("UTF-8"))
		return {
			"status": 200,
			"headers": {},
			"content": b"Deleted successfully"
		}
	elif path == "/handle_entry":
		bodydata = body.decode("UTF-8").split("\n")
		user = getUserFromID(bodydata[0])
		if user == None or user["admin"] == False:
			log(repr(user), bodydata[0])
			log("EnErr", "User tried to handle entry without sufficient permissions")
			return {
				"status": 404,
				"headers": {},
				"content": b"You need admin permissions"
			}
		forms = json.loads(read_file("public_files/entries.json"))
		i = forms[int(bodydata[2])]
		del forms[int(bodydata[2])]
		write_file("public_files/entries.json", json.dumps(forms, indent='\t').encode("UTF-8"))
		if bodydata[1] == "1":
			# Accepted the entry!
			log("E", "entry submissions: accepted an entry\n\t" + repr(i))
			post("/addentry", '\n'.join([
				i["event"],
				i["user"],
				str(i["newscore"]),
				i["mode"],
				i["note"]
			]).encode("UTF-8"))
		else:
			log("E", "entry submissions: rejected an entry\n\t" + repr(i))
		return {
			"status": 200,
			"headers": {},
			"content": b"Success"
		}
	elif path == "/upload_csv":
		bodydata = body.decode("UTF-8").split("\n")
		if getUserFromID(bodydata[0])["admin"] == False: return { # type: ignore
			"status": 404,
			"headers": {},
			"content": b"You need admin permissions"
		}
		csv = "\n".join(bodydata[1:])
		generateDataFileFromTSV(csv)
		return {
			"status": 200,
			"headers": {},
			"content": b"Successfully generated data file"
		}
	elif path == "/add_event":
		bodydata = json.loads(body.decode("UTF-8"))
		data = json.loads(read_file("public_files/data.json"))
		if bodydata["name"] not in data.keys():
			data[bodydata["name"]] = bodydata["data"]
			log("ADMIN", "Created new event with name " + repr(bodydata["name"]) + "!")
			write_file("public_files/data.json", json.dumps(data, indent='\t').encode("UTF-8"))
		else:
			log("ADMIN", "Failed to create new event with name " + repr(bodydata["name"]))
		return {
			"status": 302,
			"headers": {},
			"content": b"Success"
		}
	elif path == "/error":
		log("", "User encountered error: " + body.decode("UTF-8"))
		return {
			"status": 302,
			"headers": {},
			"content": b"Recorded successfully"
		}
	elif path == "/remove_entry":
		bodydata = body.decode("UTF-8").split("\n")
		user = getUserFromID(bodydata[0])
		if user == None: return {"status": 404, "headers": {}, "content": b"You need to be signed in"}
		if user["admin"]:
			log("ADMIN", "Removing an entry with user " + repr(bodydata[2]) + " from leaderboard " + repr(bodydata[1]))
			# remove the entry
			data = json.loads(read_file("public_files/data.json"))
			entries = data[bodydata[1]]["entries"]
			for i in range(len(entries)):
				if entries[i][0] == bodydata[2]:
					entries.remove(entries[i])
					break
			write_file("public_files/data.json", json.dumps(data, indent='\t').encode("UTF-8"))
			# return
			return {
				"status": 302,
				"headers": {},
				"content": b"Removed successfully"
			}
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": b"You need to be an admin"
		}
	else:
		log("#", "404 POST encountered: " + path)
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": b"404 POST"
		}

class MyServer(BaseHTTPRequestHandler):
	def do_GET(self):
		splitpath = self.path.split("?")
		res = get(splitpath[0], URLQuery(''.join(splitpath[1:])), SafeDict.from_list(self.headers.items()))
		self.send_response(res["status"])
		for h in res["headers"]:
			self.send_header(h, res["headers"][h])
		self.end_headers()
		c = res["content"]
		self.wfile.write(c)
	def do_POST(self):
		res = post(self.path, self.rfile.read(int(self.headers["Content-Length"])))
		self.send_response(res["status"])
		for h in res["headers"]:
			self.send_header(h, res["headers"][h])
		self.end_headers()
		self.wfile.write(res["content"])
	def log_message(self, format: str, *args: typing.Any) -> None:
		return

if __name__ == "__main__":
	running = True
	webServer = HTTPServer((hostName, serverPort), MyServer)
	webServer.timeout = 1
	print(f"Server started http://{hostName}:{serverPort}/")
	while running:
		try:
			webServer.handle_request()
		except KeyboardInterrupt:
			running = False
	webServer.server_close()
	print("Server stopped")
