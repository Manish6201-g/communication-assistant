#!/usr/bin/env python3
"""
Lightweight Web Server for AI-Based Real-Time Multilingual Communication Assistant
CGC University Mohali - Department of AI & Data Science
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure proper MIME type for ES modules
        if path.endswith(".js"):
            return "application/javascript"
        if path.endswith(".css"):
            return "text/css"
        if path.endswith(".html"):
            return "text/html"
        return super().guess_type(path)

def start_server():
    global PORT
    while PORT < 3020:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                url = f"http://localhost:{PORT}"
                print("=" * 65)
                print("  AI-Based Real-Time Multilingual Communication Assistant")
                print("  CGC University Mohali - Department of AI & Data Science")
                print("  Engineering Clinic Project (2026-27)")
                print("=" * 65)
                print(f"\n  🚀 Server running at: \033[96m{url}\033[0m")
                print("  🎙️ Speech-to-Text: Native Web Speech API")
                print("  🧠 Neural Translation: Multi-Provider NMT")
                print("  🔊 Text-to-Speech: Web Speech Synthesis")
                print("\n  Press Ctrl+C to stop the server.\n")
                
                # Automatically open in default browser
                try:
                    webbrowser.open(url)
                except Exception:
                    pass

                httpd.serve_forever()
        except OSError:
            PORT += 1

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
