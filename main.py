from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
import datetime
import traceback
import subprocess
from urllib.parse import unquote
import random

vandalize = False

hostName = "0.0.0.0"
serverPort = 12344

def read_file(filename: str) -> bytes:
	f = open(filename, "rb")
	t = f.read()
	f.close()
	return t

def write_file(filename: str, content: str):
	f = open(filename, "w")
	f.write(content)
	f.close()

def log(msg: str):
	f = open("log.txt", "a")
	f.write(datetime.datetime.now().isoformat())
	f.write(" - ")
	f.write(msg)
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

def getUserFromID(userid: str) -> dict | None:
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

def generateDataFileFromCSV(csv: str):
	log("[csv-loader] Starting!")
	# Load the CSV data
	d = [x.split(",") for x in csv.split("\n")[1:]]
	# Load the old data
	f = open("public_files/data.json", "r")
	data = json.loads(f.read())
	f.close()
	# Go through the CSV file and register the events
	newData = {}
	newentries = []
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
	# leaderboards missing from the CSV file
	for name in data:
		if name not in newData.keys():
			log(f"[csv-loader] Warning: {name} is not in the CSV file!")
			log(f"[csv-loader] \tThere are {len(data[name]['entries'])} entries")
			log("[csv-loader] \tThe leaderboard is not being deleted")
			newData[name] = data[name]
		else:
			newData[name]["entries"] = data[name]["entries"]
			newentries.remove(name)
	# List of new leaderboards
	log("[csv-loader] New leaderboards:")
	for x in newentries: log("[csv-loader]\t" + x)
	# Save the data!
	f = open("public_files/data.json", "w")
	f.write(json.dumps(newData, indent='\t'))
	f.close()
	# Finish
	log("[csv-loader] Finished!")

def get(path: str):
	log_existence_check()
	if vandalize:
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": "<!DOCTYPE html><html><head></head><body>Hahaha! The website is gone!!!</body></html>"
		}
	user = getUserFromID(''.join(path.split("?")[1:]))
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
			"content": json.dumps(ou)
		}
	elif os.path.isfile("public_files" + path.split("?")[0]):
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
				}[path.split("?")[0].split(".")[-1]]
			},
			"content": read_file("public_files" + path.split("?")[0])
		}
	elif path.split("?")[0] == "/":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<!DOCTYPE html><html><head><script>//{random.random()}</script></head><body><script>location.replace('/home.html'+location.search);</script></body></html>"
		}
	elif path.startswith("/leaderboards/"):
		name = path.split("?")[0][14:]
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("leaderboard.html").replace(b"{{NAME}}", name.replace("%20", " ").encode("UTF-8"))
		}
	elif path.startswith("/badges/"):
		name = path.split("?")[0].split("/")[2]
		rank = path.split("?")[0].split("/")[3]
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
		name = path.split("?")[0].split("/")[2]
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
		formid = path.split("?")[0].split("/")[2]
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
			"content": "<script>location.replace('/form_list.html')</script>"
		}
	elif path.split("?")[0] == "/usercheck":
		return {
			"status": 200,
			"headers": {
				"Content-Type": "application/json"
			},
			"content": json.dumps([{"name": user["name"], "admin": user["admin"]}]) if user != None else "[]"
		}
	elif path.split("?")[0] == "/user_id_create":
		u = path.split("?")[1].split("&")[0]
		p = path.split("?")[1].split("&")[1]
		userid = getIDFromUser(unquote(u), unquote(p))
		# print(repr(u), repr(p), repr(id))
		if userid == None:
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": "<script>location.replace('/login.html#invalid')</script>"
			}
		log("User " + u + " logged in!")
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<script>location.replace('/?{userid}')</script>"
		}
	elif path.split("?")[0] == "/user_id_create/sudo":
		u = path.split("?")[1].split("&")[0]
		p = unquote(path.split("?")[1].split("&")[1])
		user = getUserFromID(u)
		if user == None: return {"status": 404, "headers": {}, "content": ""}
		if user["admin"]:
			newID = getIDFromUser(p, getPwdFromUser(p)) # type: ignore
			newname = getUserFromID(newID)['name'] # type: ignore
			log("User " + repr(user["name"]) + " switch to " + repr(newname))
			return {
				"status": 200,
				"headers": {
					"Content-Type": "text/html"
				},
				"content": f"<script>location.replace('/profile/{newname}?{newID}')</script>"
			}
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": f"<script>location.replace('/?{u}')</script>"
		}
	elif path.split("?")[0] == "/applications.txt":
		if "?" not in path: return {
			"status": 404,
			"headers": {},
			"content": ""
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
				"content": ""
			}
	elif path.split("?")[0] == "/forms.json":
		if "?" not in path: return {
			"status": 404,
			"headers": {},
			"content": ""
		}
		u = path.split("?")[1]
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
			"content": json.dumps(ou)
		}
	elif path.split("?")[0] in ["/special/badges", "/special/meta", "/special/activity"]:
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": read_file("special.html")
		}
	elif path.startswith("/graph/"):
		event = path.split("/")[2]
		graph_type = path.split("/")[3]
		event_data = json.loads(read_file("public_files/data.json"))[event]["entries"]
		entries = {}
		for d in event_data:
			entries[d[0]] = d[1]
		data = {
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
	else: # 404 page
		log("404 encountered: " + path)
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": ""
		}

def post(path, body):
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
			write_file("public_files/data.json", json.dumps(data, indent='\t'))
		except Exception as e:
			update += "\nError was:\n\n"
			update += ''.join(traceback.format_exception(type(e), e, e.__traceback__))
		log("entryeditor: " + update)
		return {
			"status": 200,
			"headers": {
				"Content-Type": "text/plain"
			},
			"content": update
		}
	elif path == "/tryaddentry":
		bodydata = json.loads(body.decode("UTF-8"))
		forms = json.loads(read_file("public_files/entries.json"))
		forms.append(bodydata)
		write_file("public_files/entries.json", json.dumps(forms, indent='\t'))
		# log("Tried to add an entry...\n\t" + repr(bodydata))
		return {
			"status": 200,
			"headers": {},
			"content": ""
		}
	elif path == "/add_application":
		bodydata = body.decode("UTF-8").split("\n")
		c = read_file("applications.txt")
		c = f"""\n==========\nUsername: {bodydata[0]}\nEmail address: {bodydata[1]}\n==========\n\n\n{c}"""
		log(f"create application (username={bodydata[0]}, email={bodydata[1]})")
		write_file("applications.txt", c)
		return {
			"status": 301,
			"headers": {},
			"content": ""
		}
	elif path == "/createuser":
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
		log("accept application for " + bodydata[0])
		write_file("users.json", c)
		# Update applications
		c = read_file("applications.txt").decode("UTF-8")
		c = c.replace(f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}", f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}\n[Accepted]")
		write_file("applications.txt", c)
		# Finish
		return {
			"status": 301,
			"headers": {},
			"content": ""
		}
	elif path == "/rejectprofile":
		bodydata = body.decode("UTF-8").split("\n")
		# Update applications
		c = read_file("applications.txt").decode("UTF-8")
		c = c.replace(f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}", f"Username: {bodydata[0]}\nEmail address: {bodydata[1]}\n[Rejected]")
		log("reject application for " + bodydata[0])
		write_file("applications.txt", c)
		# Finish
		return {
			"status": 301,
			"headers": {},
			"content": ""
		}
	elif path == "/setting/pwd":
		bodydata = body.decode("UTF-8").split("\n")
		ou = json.loads(read_file("users.json"))
		name = "<error>"
		for n in ou:
			if str(multiply(n["name"], n["password"])) == bodydata[0]:
				n["password"] = bodydata[1]
				name = n["name"]
		log(f"{name} update pwd")
		write_file("users.json", json.dumps(ou, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": ""
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
		log(f"{name} update desc\n\tfrom: {repr(desc_from)}\n\tto: {repr(newdesc)}")
		write_file("users.json", json.dumps(ou, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": ""
		}
	elif path == "/submit_form":
		bodydata = json.loads(body.decode("UTF-8"))
		forms = json.loads(read_file("forms.json"))
		name = getUserFromID(bodydata["user"])["name"] # type: ignore
		forms[bodydata["id"]]["responses"].append({
			"user": name,
			"results": bodydata["results"]
		})
		log(f"{name} submit form {forms[bodydata['id']]['name']}: " + json.dumps(bodydata["results"], indent='\t'))
		write_file("forms.json", json.dumps(forms, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": ""
		}
	elif path == "/delete_submission":
		bodydata = body.decode("UTF-8").split("\n")
		if getUserFromID(bodydata[0])["admin"] == False: return { # type: ignore
			"status": 404,
			"headers": {},
			"content": ""
		}
		forms = json.loads(read_file("forms.json"))
		del forms[int(bodydata[1])]["responses"][int(bodydata[2])]
		write_file("forms.json", json.dumps(forms, indent='\t'))
		return {
			"status": 200,
			"headers": {},
			"content": ""
		}
	elif path == "/handle_entry":
		bodydata = body.decode("UTF-8").split("\n")
		if getUserFromID(bodydata[0])["admin"] == False: return { # type: ignore
			"status": 404,
			"headers": {},
			"content": ""
		}
		forms = json.loads(read_file("public_files/entries.json"))
		i = forms[int(bodydata[2])]
		del forms[int(bodydata[2])]
		write_file("public_files/entries.json", json.dumps(forms, indent='\t'))
		if bodydata[1] == "1":
			# Accepted the entry!
			log("entry submissions: accepted an entry\n\t" + repr(i))
			post("/addentry", '\n'.join([
				i["event"],
				i["user"],
				str(i["newscore"]),
				i["mode"],
				i["note"]
			]).encode("UTF-8"))
		else:
			log("entry submissions: rejected an entry\n\t" + repr(i))
		return {
			"status": 200,
			"headers": {},
			"content": ""
		}
	elif path == "/upload_csv":
		bodydata = body.decode("UTF-8").split("\n")
		if getUserFromID(bodydata[0])["admin"] == False: return { # type: ignore
			"status": 404,
			"headers": {},
			"content": ""
		}
		csv = "\n".join(bodydata[1:])
		generateDataFileFromCSV(csv)
		return {
			"status": 200,
			"headers": {},
			"content": ""
		}
	elif path == "/add_event":
		bodydata = json.loads(body.decode("UTF-8"))
		data = json.loads(read_file("public_files/data.json"))
		if bodydata["name"] not in data.keys():
			data[bodydata["name"]] = bodydata["data"]
			log("Created new event with name " + repr(bodydata["name"]) + "!")
			write_file("public_files/data.json", json.dumps(data, indent='\t'))
		else:
			log("Failed to create new event with name " + repr(bodydata["name"]))
		return {
			"status": 302,
			"headers": {},
			"content": ""
		}
	elif path == "/error":
		log("User encountered error: " + body.decode("UTF-8"))
		return {
			"status": 302,
			"headers": {},
			"content": ""
		}
	elif path == "/remove_entry":
		bodydata = body.decode("UTF-8").split("\n")
		user = getUserFromID(bodydata[0])
		if user == None: return {"status": 404, "headers": {}, "content": ""}
		if user["admin"]:
			log("Removing an entry with user " + repr(bodydata[2]) + " from leaderboard " + repr(bodydata[1]))
			# remove the entry
			data = json.loads(read_file("public_files/data.json"))
			entries = data[bodydata[1]]["entries"]
			for i in range(len(entries)):
				if entries[i][0] == bodydata[2]:
					entries.remove(entries[i])
			write_file("public_files/data.json", json.dumps(data, indent='\t'))
			# return
			return {
				"status": 302,
				"headers": {},
				"content": ""
			}
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": ""
		}
	else:
		log("404 POST encountered: " + path)
		return {
			"status": 404,
			"headers": {
				"Content-Type": "text/html"
			},
			"content": ""
		}

class MyServer(BaseHTTPRequestHandler):
	def do_GET(self):
		res = get(self.path)
		self.send_response(res["status"])
		for h in res["headers"]:
			self.send_header(h, res["headers"][h])
		self.end_headers()
		c = res["content"]
		if isinstance(c, str): c = c.encode("utf-8")
		self.wfile.write(c)
	def do_POST(self):
		res = post(self.path, self.rfile.read(int(self.headers["Content-Length"])))
		self.send_response(res["status"])
		for h in res["headers"]:
			self.send_header(h, res["headers"][h])
		self.end_headers()
		self.wfile.write(res["content"].encode("utf-8"))
	def log_message(self, _: str, *args) -> None:
		return
		# if 400 <= int(args[1]) < 500:
		# 	# Errored request!
		# 	print(u"\u001b[31m", end="")
		# print(args[0].split(" ")[0], "request to", args[0].split(" ")[1], "(status code:", args[1] + ")")
		# print(u"\u001b[0m", end="")
		# # don't output requests

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
