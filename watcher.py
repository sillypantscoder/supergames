import subprocess
import time
import sys

codespace = input("Enter the codespace name\n")

def start_server():
	global server
	try:
		server.send_signal(2)
		server.wait()
	except NameError: pass
	server = subprocess.Popen(["python3", "main.py"])
	time.sleep(1)
	subprocess.run(["gh", "codespace", "ports", "visibility", "12344:public", "--codespace", codespace])
	return server

server = start_server()

while True:
	p = subprocess.Popen(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", f"https://{codespace}-12344.app.github.dev/home.html"], stdout=subprocess.PIPE)
	time.sleep(1)
	if p.poll() == None or server.poll() != None:
		p.kill()
		print("\nServer is not responding!")
		server.send_signal(2)
		server.wait()
		print("Killed the server!")
		time.sleep(3)
		start_server()
		print("Restarted the server.")
	else:
		out = int(p.stdout.read().decode("UTF-8"))
		if out == 200:
			print(f"[fine 200]", end="")
		else:
			print(f"\npossible problem! status code: {out}")
		sys.stdout.flush()
