import http.server
import socketserver
import os
import webbrowser

PORT = 8081
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server.")
        webbrowser.open(f"http://localhost:{PORT}/index.html")
        httpd.serve_forever()
except OSError as e:
    print(f"Error: Port {PORT} might be in use. Please close other servers or change the port.")
    input("Press Enter to exit...")
