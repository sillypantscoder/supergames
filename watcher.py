import subprocess
import time
import sys

codespace = input("Enter the codespace name\n")

def start_server():
	server = subprocess.Popen(["python3", "main.py"])
	time.sleep(1)
	subprocess.run(["gh", "codespace", "ports", "visibility", "12344:public", "--codespace", codespace])
	return server

server = start_server()

while True:
	p = subprocess.Popen(["curl", f"https://{codespace}-12344.app.github.dev/home.html"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	time.sleep(1)
	if p.poll() == None:
		p.kill()
		print("\nServer is not responding!")
		server.kill()
		print("Killed the server!")
		time.sleep(3)
		start_server()
		print("Restarted the server.")
	else:
		print("fine...", end="")
		sys.stdout.flush()
