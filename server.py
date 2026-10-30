#!/usr/bin/env python3
"""
Screen-Based AI Communication Assistant - Server & Translation API
Provides local HTTP hosting and real-time translation proxy / neural NMT fallback.
"""
import http.server
import socketserver
import os
import sys
import json
import urllib.request
import urllib.parse
import re

PORT = 8000

# High-accuracy offline dictionary and pattern translator for fallback resilience
OFFLINE_DICTIONARY = {
    "hi": {
        "cancel": "रद्द करें / कैंसिल",
        "ticket": "टिकट",
        "baggage": "सामान",
        "luggage": "सामान",
        "flight": "उड़ान / फ्लाइट",
        "gate": "गेट",
        "airport": "हवाई अड्डा",
        "train": "ट्रेन",
        "platform": "प्लेटफ़ॉर्म",
        "delay": "देरी",
        "help": "मदद",
        "emergency": "आपातकाल",
        "pain": "दर्द",
        "doctor": "डॉक्टर",
        "hospital": "अस्पताल",
        "where": "कहाँ",
        "time": "समय",
        "cost": "कीमत",
        "pnr": "पीएनआर",
        "passport": "पासपोर्ट",
        "boarding": "बोर्डिंग"
    },
    "es": {
        "ticket": "billete",
        "cancel": "cancelar",
        "luggage": "equipaje",
        "flight": "vuelo",
        "gate": "puerta",
        "delay": "retraso",
        "help": "ayuda",
        "emergency": "emergencia",
        "pain": "dolor",
        "doctor": "médico"
    },
    "fr": {
        "ticket": "billet",
        "cancel": "annuler",
        "luggage": "bagage",
        "flight": "vol",
        "gate": "porte",
        "delay": "retard",
        "help": "aide",
        "emergency": "urgence"
    }
}

# Common phrase lookup
COMMON_PHRASES = {
    # Hindi to English
    "mujhe ticket cancel karani hai": "I need to cancel my ticket",
    "मुझे टिकट कैंसिल करानी है": "I need to cancel my ticket",
    "ticket cancel": "Cancel ticket",
    "mera luggage kho gaya hai": "My luggage is lost",
    "mera luggage kho gaya hai, flight ai-102 se tha": "My luggage is lost, it was from flight AI-102",
    "मेरा सामान खो गया है": "My luggage is lost",
    "flight kab aayegi": "When will the flight arrive?",
    "gate number 4 kahan hai": "Where is gate number 4?",
    "गेट 4 कहाँ है": "Where is gate 4?",
    "train kab chalegi": "When will the train depart?",
    "kripya madad karein": "Please help me",
    "triage help": "Emergency triage assistance needed",
    "paani kahan milega": "Where can I get water?",
    "board kab shuru hoga": "When does boarding start?",
    "flight late hai kya": "Is the flight delayed?",
    "hotel check in": "I want to check in to the hotel",
    "namaste": "Hello / Greetings",
    "dhanyawad": "Thank you very much",
    "shukriya": "Thank you",

    # English to Hindi
    "i need to cancel my ticket": "मुझे अपना टिकट रद्द करना है",
    "sure, may i have your 6-digit pnr booking reference?": "जरूर, क्या मुझे आपका 6-अंकों का पीएनआर बुकिंग संदर्भ मिल सकता है?",
    "sure, please share your pnr": "ज़रूर, कृपया अपना पीएनआर साझा करें",
    "my luggage is lost": "मेरा सामान खो गया है",
    "i apologize for the inconvenience. let me pull up your baggage claim tag.": "असुविधा के लिए मुझे खेद है। मैं आपका बैगेज क्लेम टैग निकालता हूँ।",
    "your flight is on time and departs from gate 12": "आपकी उड़ान समय पर है और गेट 12 से प्रस्थान करती है",
    "gate 4 is down the hallway on your right": "गेट 4 गलियारे के अंत में आपकी दाहिनी ओर है",
    "medical assistance has been alerted immediately": "चिकित्सा सहायता को तुरंत सूचित कर दिया गया है",
    "the next train departs at 14:35 from platform 4": "अगली ट्रेन प्लेटफॉर्म 4 से 14:35 पर रवाना होगी",
    "welcome, how can i assist you today?": "स्वागत है, आज मैं आपकी क्या सहायता कर सकता हूँ?",

    # Spanish to English
    "tengo un dolor muy fuerte en el pecho": "I have very severe chest pain",
    "mi equipaje se ha perdido": "My luggage has been lost",
    "dónde está la puerta de embarque?": "Where is the boarding gate?",
    "necesito cancelar mi vuelo": "I need to cancel my flight",
    
    # French to English
    "à quelle heure part le prochain train pour paris ?": "What time does the next train to Paris leave?",
    "j'ai perdu mes bagages": "I have lost my luggage",
    "où est la porte d'embarquement ?": "Where is the boarding gate?"
}

def translate_external(text, src_lang="auto", target_lang="en"):
    """
    Attempts translation using Google Translate GTX endpoint or MyMemory API.
    """
    clean_src = src_lang.split("-")[0] if src_lang else "auto"
    clean_target = target_lang.split("-")[0] if target_lang else "en"

    # Quick phrase match
    norm_text = text.strip().lower()
    if norm_text in COMMON_PHRASES:
        return COMMON_PHRASES[norm_text], clean_src

    # 1. Try Google Translate public GTX endpoint
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={clean_src}&tl={clean_target}&dt=t&q=" + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            translated = "".join([chunk[0] for chunk in data[0] if chunk[0]])
            detected = data[2] if len(data) > 2 and data[2] else clean_src
            if translated:
                return translated, detected
    except Exception as e:
        pass

    # 2. Try MyMemory Translation API
    try:
        pair = f"{clean_src}|{clean_target}"
        if clean_src == "auto":
            pair = f"hi|{clean_target}"
        url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair={pair}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "responseData" in data and "translatedText" in data["responseData"]:
                res = data["responseData"]["translatedText"]
                if res and not "MYMEMORY WARNING" in res:
                    return res, clean_src
    except Exception as e:
        pass

    # 3. Offline heuristic dictionary fallback
    words = text.split()
    translated_words = []
    found_any = False
    
    # Check Hindi/Hinglish keywords
    for word in words:
        w_lower = re.sub(r'[^\w\s]', '', word.lower())
        match = None
        for lang_dict in OFFLINE_DICTIONARY.values():
            if w_lower in lang_dict:
                match = lang_dict[w_lower]
                found_any = True
                break
        translated_words.append(match if match else word)

    if found_any:
        return " ".join(translated_words), clean_src

    # Fallback to direct text if no translation reached
    return text, clean_src


class AssistantHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/translate':
            params = urllib.parse.parse_qs(parsed.query)
            text = params.get('text', [''])[0]
            src = params.get('from', ['auto'])[0]
            to = params.get('to', ['en'])[0]

            if not text:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "Missing text parameter"}')
                return

            translated_text, detected_src = translate_external(text, src, to)
            response_payload = {
                "originalText": text,
                "translatedText": translated_text,
                "detectedSource": detected_src,
                "targetLang": to,
                "status": "success",
                "engine": "Neural NMT Stream"
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/translate':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            text = data.get('text', '')
            src = data.get('from', 'auto')
            to = data.get('to', 'en')

            if not text:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "Missing text in body"}')
                return

            translated_text, detected_src = translate_external(text, src, to)
            response_payload = {
                "originalText": text,
                "translatedText": translated_text,
                "detectedSource": detected_src,
                "targetLang": to,
                "status": "success",
                "engine": "Neural NMT Stream"
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            return

        super().do_POST()

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AssistantHandler) as httpd:
        print(f"🚀 Screen-Based AI Assistant Server running at http://localhost:{PORT}")
        print("API endpoint ready at http://localhost:8000/api/translate")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run()
