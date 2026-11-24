# -*- coding: utf-8 -*-
"""
Script tự động sinh file Voice AI (.mp3) cho toàn bộ 36 Hiện vật và 18 Gian phòng
Sử dụng endpoint chuẩn của hệ thống: POST /api/languages/generate-tts
Đồng bộ audioUrl / audioNarrationUrl vào cơ sở dữ liệu thật (PostgreSQL & MongoDB).
"""

import urllib.request
import json
import ssl
import time

ctx = ssl._create_unverified_context()
BASE_API = "https://museumhcm.duckdns.org/api"


def generate_tts(text: str, lang_code: str, code: str) -> str:
    """Gọi API sinh tệp âm thanh Voice AI"""
    req = urllib.request.Request(
        f"{BASE_API}/languages/generate-tts",
        data=json.dumps({
            "text": text,
            "langCode": lang_code,
            "roomCode": code.lower().replace("-", "_")
        }).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req, context=ctx) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        if res.get("success") and res.get("audioUrl"):
            return res.get("audioUrl")
    return ""


def update_artifact_audio(art_id: str, audio_url: str):
    """Cập nhật đường dẫn audio cho hiện vật"""
    req = urllib.request.Request(
        f"{BASE_API}/artifacts/{art_id}",
        data=json.dumps({
            "audioNarrationUrl": audio_url,
            "translations": {
                "vi": {
                    "audioNarrationUrl": audio_url
                }
            }
        }).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        method="PUT"
    )
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read().decode("utf-8"))


def update_room_audio(room_id: str, audio_url: str):
    """Cập nhật đường dẫn audio cho gian phòng"""
    req = urllib.request.Request(
        f"{BASE_API}/rooms/{room_id}",
        data=json.dumps({
            "audioUrl": audio_url,
            "aiVoiceEnabled": True,
            "translations": {
                "vi": {
                    "audioUrl": audio_url
                }
            }
        }).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        method="PUT"
    )
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run():
    print("=== 1. TỰ ĐỘNG SINH VOICE AI CHO TOÀN BỘ HIỆN VẬT (36 HIỆN VẬT) ===")
    art_req = urllib.request.Request(f"{BASE_API}/artifacts", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(art_req, context=ctx) as resp:
        art_res = json.loads(resp.read().decode("utf-8"))
    
    artifacts = art_res.get("data", [])
    print(f"-> Tìm thấy {len(artifacts)} hiện vật.")

    for i, art in enumerate(artifacts):
        code = art.get("code")
        name = art.get("name")
        art_id = art.get("id") or art.get("_id")
        
        # Kiểm tra kịch bản
        trans = art.get("translations", {}) or {}
        vi_trans = trans.get("vi", {}) if isinstance(trans, dict) else {}
        script = vi_trans.get("narrationScript") or art.get("description") or ""

        existing_audio = art.get("audioNarrationUrl") or vi_trans.get("audioNarrationUrl")
        if existing_audio and existing_audio.startswith("/uploads/audio/"):
            print(f"[{i+1}/{len(artifacts)}] [{code}] {name} -> Đã có audio: {existing_audio}")
            continue

        if not script:
            print(f"[{i+1}/{len(artifacts)}] [{code}] {name} -> Chưa có kịch bản thuyết minh, bỏ qua.")
            continue

        print(f"[{i+1}/{len(artifacts)}] Đang tạo Voice AI cho [{code}] {name} ({len(script)} ký tự)...")
        try:
            audio_url = generate_tts(script, "vi", f"art_{code}")
            if audio_url:
                update_artifact_audio(art_id, audio_url)
                print(f"    -> Thành công: {audio_url}")
            else:
                print(f"    -> Không tạo được audioUrl cho {code}")
        except Exception as e:
            print(f"    [!] Lỗi: {e}")

        time.sleep(0.5)

    print("\n=== 2. TỰ ĐỘNG SINH VOICE AI CHO TOÀN BỘ GIAN PHÒNG (18 PHÒNG) ===")
    room_req = urllib.request.Request(f"{BASE_API}/rooms", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(room_req, context=ctx) as resp:
        room_res = json.loads(resp.read().decode("utf-8"))

    rooms = room_res.get("data", room_res)
    print(f"-> Tìm thấy {len(rooms)} gian phòng.")

    for i, room in enumerate(rooms):
        code = room.get("code")
        name = room.get("name")
        room_id = room.get("id") or room.get("_id")

        trans = room.get("translations", {}) or {}
        vi_trans = trans.get("vi", {}) if isinstance(trans, dict) else {}
        script = room.get("aiScript") or vi_trans.get("narrationScript") or room.get("description") or ""

        existing_audio = room.get("audioUrl") or vi_trans.get("audioUrl")
        if existing_audio and existing_audio.startswith("/uploads/audio/"):
            print(f"[{i+1}/{len(rooms)}] [{code}] {name} -> Đã có audio: {existing_audio}")
            continue

        if not script:
            print(f"[{i+1}/{len(rooms)}] [{code}] {name} -> Chưa có kịch bản, bỏ qua.")
            continue

        print(f"[{i+1}/{len(rooms)}] Đang tạo Voice AI cho [{code}] {name} ({len(script)} ký tự)...")
        try:
            audio_url = generate_tts(script, "vi", f"room_{code}")
            if audio_url:
                update_room_audio(room_id, audio_url)
                print(f"    -> Thành công: {audio_url}")
            else:
                print(f"    -> Không tạo được audioUrl cho {code}")
        except Exception as e:
            print(f"    [!] Lỗi: {e}")

        time.sleep(0.5)

    print("\n=== HOÀN TẤT SINH VOICE AI CHO TOÀN BỘ HIỆN VẬT VÀ GIAN PHÒNG ===")


if __name__ == "__main__":
    run()
