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
import json

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ('/api/tts', '/api/translate'):
            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg' if parsed.path == '/api/tts' else 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            return
        return super().do_HEAD()

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

        if parsed.path == '/api/translate':
            params = urllib.parse.parse_qs(parsed.query)
            sl = params.get('sl', ['auto'])[0]
            tl = params.get('tl', ['en'])[0]
            q = params.get('q', [''])[0]

            if not q.strip():
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error": "Missing query text"}')
                return

            try:
                encoded_q = urllib.parse.quote(q)
                # Primary: Google Dictionary / NMT endpoint
                url = f"https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl={urllib.parse.quote(sl)}&tl={urllib.parse.quote(tl)}&q={encoded_q}"
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                })
                with urllib.request.urlopen(req, timeout=6) as resp:
                    raw = resp.read().decode('utf-8')
                    parsed_json = json.loads(raw)
                    translated = ""
                    if isinstance(parsed_json, list) and len(parsed_json) > 0:
                        if isinstance(parsed_json[0], str):
                            translated = parsed_json[0]
                        elif isinstance(parsed_json[0], list) and len(parsed_json[0]) > 0:
                            translated = parsed_json[0][0]

                if translated:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    res_body = json.dumps({
                        "translatedText": translated,
                        "provider": "Google Neural Machine Translation (GNMT)"
                    }, ensure_ascii=False).encode('utf-8')
                    self.wfile.write(res_body)
                    return
            except Exception as e:
                print(f"[Translate Proxy Error]: {e}")

            # Fallback secondary endpoint: translate.google.com single
            try:
                url2 = f"https://translate.google.com/translate_a/single?client=tw-ob&sl={urllib.parse.quote(sl)}&tl={urllib.parse.quote(tl)}&dt=t&q={encoded_q}"
                req2 = urllib.request.Request(url2, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
                })
                with urllib.request.urlopen(req2, timeout=6) as resp2:
                    raw2 = resp2.read().decode('utf-8')
                    parsed_json2 = json.loads(raw2)
                    translated2 = "".join([segment[0] for segment in parsed_json2[0] if segment and segment[0]])

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                res_body2 = json.dumps({
                    "translatedText": translated2,
                    "provider": "Google NMT Cluster"
                }, ensure_ascii=False).encode('utf-8')
                self.wfile.write(res_body2)
                return
            except Exception as err:
                print(f"[Translate Upstream Error]: {err}")
                self.send_response(502)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error": "Translation service unavailable"}')
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
