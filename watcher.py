import subprocess
import time
import sys

server = subprocess.Popen(["python3", "main.py"])

while True:
	p = subprocess.Popen(["curl", "https://silver-space-giggle-rx6r47499j535wqv-12344.app.github.dev/"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	time.sleep(1)
	if p.poll() == None:
		p.kill()
		print("Server is not responding!")
		server.kill()
		print("Killed the server!")
		exit()
	else:
		print("fine...", end="")
		sys.stdout.flush()
