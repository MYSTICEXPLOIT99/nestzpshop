import subprocess
import os

artifact_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\1a1707eb-d540-4b8b-9426-d7fa58af3a70"
chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

targets = [
    ("http://localhost:3000/", "preview_larger_homestats.png"),
    ("http://localhost:3000/#products-catalog", "preview_products_square.png"),
    ("http://localhost:3000/store", "preview_store_square.png")
]

for url, filename in targets:
    out_path = os.path.join(artifact_dir, filename)
    cmd = [
        chrome_exe,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=4000",
        f"--screenshot={out_path}",
        "--window-size=1440,1600",
        "--hide-scrollbars",
        url
    ]
    print(f"Capturing {url} to {filename}...")
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25)
        if os.path.exists(out_path):
            print(f"  SUCCESS: {os.path.getsize(out_path)} bytes")
        else:
            print(f"  FAILED to capture {filename}")
    except Exception as e:
        print(f"  ERROR: {e}")
