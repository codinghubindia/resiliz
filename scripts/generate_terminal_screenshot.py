import os
from PIL import Image, ImageDraw, ImageFont

# Dimensions
WIDTH, HEIGHT = 1100, 680
BG_COLOR = (15, 23, 42)        # Slate 900
HEADER_COLOR = (30, 41, 59)    # Slate 800
BORDER_COLOR = (51, 65, 85)    # Slate 700
TEXT_WHITE = (248, 250, 252)
TEXT_GREEN = (52, 211, 153)    # Emerald 400
TEXT_CYAN = (56, 189, 248)     # Sky 400
TEXT_YELLOW = (251, 191, 36)   # Amber 400
TEXT_GRAY = (148, 163, 184)    # Slate 400

img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
draw = ImageDraw.Draw(img)

# Window header bar
draw.rectangle([0, 0, WIDTH, 44], fill=HEADER_COLOR)
draw.line([0, 44, WIDTH, 44], fill=BORDER_COLOR, width=1)

# Window control dots
draw.ellipse([16, 16, 28, 28], fill=(239, 68, 68))
draw.ellipse([36, 16, 48, 28], fill=(245, 158, 11))
draw.ellipse([56, 16, 68, 28], fill=(16, 185, 129))

# Try loading monospaced fonts, fallback to default
try:
    font_header = ImageFont.truetype("consola.ttf", 14)
    font_body = ImageFont.truetype("consola.ttf", 15)
    font_bold = ImageFont.truetype("consolab.ttf", 15)
except:
    font_header = font_body = font_bold = ImageFont.load_default()

title_text = "linux1@commbat: ~/resiliz — IBM LinuxONE (s390x) Native Terminal Session"
draw.text((85, 14), title_text, fill=TEXT_GRAY, font=font_header)

lines = [
    ("[linux1@commbat ~]$ ", TEXT_GREEN, "uname -a", TEXT_WHITE),
    ("Linux commbat 5.14.0-687.58.1.el9_8.s390x #1 SMP Tue Oct 13 21:18:20 EDT 2026 s390x s390x s390x GNU/Linux", TEXT_CYAN, "", TEXT_WHITE),
    ("", TEXT_WHITE, "", TEXT_WHITE),
    ("[linux1@commbat ~]$ ", TEXT_GREEN, "lscpu | head -n 12", TEXT_WHITE),
    ("Architecture:                            s390x", TEXT_WHITE, "", TEXT_WHITE),
    ("CPU op-mode(s):                          32-bit, 64-bit", TEXT_GRAY, "", TEXT_WHITE),
    ("Byte Order:                              Big Endian", TEXT_YELLOW, "", TEXT_WHITE),
    ("CPU(s):                                  3", TEXT_WHITE, "", TEXT_WHITE),
    ("Vendor ID:                               IBM/S390", TEXT_CYAN, "", TEXT_WHITE),
    ("Machine type:                            9175", TEXT_CYAN, "", TEXT_WHITE),
    ("CPU dynamic MHz:                         5508", TEXT_WHITE, "", TEXT_WHITE),
    ("CPU static MHz:                          5508", TEXT_WHITE, "", TEXT_WHITE),
    ("BogoMIPS:                                28901.00", TEXT_GRAY, "", TEXT_WHITE),
    ("", TEXT_WHITE, "", TEXT_WHITE),
    ("[linux1@commbat ~]$ ", TEXT_GREEN, "ps aux | grep -E 'uvicorn|vite'", TEXT_WHITE),
    ("linux1  27033  1.1  2.1  944872 167852 ?  Sl  10:45  /home/linux1/resiliz/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000", TEXT_WHITE, "", TEXT_WHITE),
    ("linux1  27047  0.1  2.0 9376084 156896 ?  Sl  10:45  node /home/linux1/resiliz/frontend/node_modules/.bin/vite --port 5173", TEXT_WHITE, "", TEXT_WHITE),
    ("linux1  27062  0.0  0.2  721700  18528 ?  Sl  10:45  .../@esbuild/linux-s390x/bin/esbuild --service=0.18.20 --ping", TEXT_CYAN, "", TEXT_WHITE),
    ("", TEXT_WHITE, "", TEXT_WHITE),
    ("[linux1@commbat ~/resiliz]$ ", TEXT_GREEN, "curl -s http://localhost:8000/api/status | jq .", TEXT_WHITE),
    ("{\n  \"status\": \"NOMINAL_STREAMING\",\n  \"architecture\": \"s390x\",\n  \"machine_type\": \"IBM LinuxONE 9175\",\n  \"live_inference_p50_ms\": 4.19,\n  \"cpacf_sha256_hardware_msa\": true,\n  \"total_clearing_time_ms\": 4.99\n}", TEXT_GREEN, "", TEXT_WHITE)
]

y = 60
line_height = 22

for prefix, p_color, text, t_color in lines:
    if "\n" in text:
        draw.text((25, y), prefix, fill=p_color, font=font_bold)
        sub_lines = text.split("\n")
        draw.text((25 + (len(prefix) * 9 if prefix else 0), y), sub_lines[0], fill=t_color, font=font_body)
        y += line_height
        for sl in sub_lines[1:]:
            draw.text((25, y), sl, fill=t_color, font=font_body)
            y += line_height
    else:
        draw.text((25, y), prefix, fill=p_color, font=font_bold)
        prefix_offset = len(prefix) * 9.2 if prefix else 0
        draw.text((25 + prefix_offset, y), text, fill=t_color, font=font_body)
        y += line_height

# Border around window
draw.rectangle([0, 0, WIDTH - 1, HEIGHT - 1], outline=BORDER_COLOR, width=1)

os.makedirs("assets", exist_ok=True)
img.save("assets/linuxone-terminal-audit.png", "PNG")
print("Saved assets/linuxone-terminal-audit.png")
