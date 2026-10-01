#!/usr/bin/env python3
"""
Lightweight Web Server for AI-Based Real-Time Multilingual Communication Assistant
CGC University Mohali - Department of AI & Data Science
Includes built-in Neural TTS Audio Proxy for Pure Native Indian Languages (Punjabi, Hindi, etc.)
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import urllib.request
import urllib.parse

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/tts':
            params = urllib.parse.parse_qs(parsed.query)
            tl = params.get('tl', ['en'])[0]
            q = params.get('q', [''])[0]

            if not q.strip():
                self.send_response(400)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Missing text')
                return

            try:
                encoded_q = urllib.parse.quote(q)
                tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={urllib.parse.quote(tl)}&q={encoded_q}"
                req = urllib.request.Request(tts_url, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                with urllib.request.urlopen(req, timeout=6) as resp:
                    audio_data = resp.read()

                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(len(audio_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.end_headers()
                self.wfile.write(audio_data)
                return
            except Exception as e:
                print(f"[TTS Server Error] Language {tl}: {e}")
                self.send_response(502)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'TTS Upstream error')
                return

        return super().do_GET()

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
                print("  🔊 Pure Native Indian TTS: Punjabi, Hindi, etc. Active (/api/tts)")
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
