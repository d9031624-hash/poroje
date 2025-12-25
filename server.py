from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil, os
from datetime import datetime

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# برای تست: کاربران و پیام‌ها
users = {}  # phone -> {password, first_name, last_name, profile_pic}
messages = []  # لیست پیام‌ها: {sender, receiver, text, image, timestamp}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ثبت نام
@app.post("/api/register")
def register(phone: str = Form(...), password: str = Form(...)):
    if phone in users:
        return {"success": False, "message": "کاربر موجود است"}
    users[phone] = {"password": password, "first_name":"","last_name":"","profile_pic":""}
    return {"success": True}

# ورود
@app.post("/api/login")
def login(phone: str = Form(...), password: str = Form(...)):
    if phone in users and users[phone]["password"]==password:
        return {"success": True}
    return {"success": False, "message":"شماره یا رمز اشتباه است"}

# آپلود پروفایل
@app.post("/api/upload-profile")
def upload_profile(phone: str = Form(...), first_name: str = Form(...), last_name: str = Form(...), file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1]
    filename = f"{phone}.{ext}"
    filepath = f"uploads/{filename}"
    with open(filepath,"wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    users[phone]["profile_pic"] = filepath
    users[phone]["first_name"] = first_name
    users[phone]["last_name"] = last_name
    return {"success": True}

# ارسال پیام
@app.post("/api/send-message")
def send_message(sender: str = Form(...), receiver: str = Form(...), text: str = Form(...), file: UploadFile = File(None)):
    image_path = ""
    if file:
        ext = file.filename.split('.')[-1]
        filename = f"{datetime.now().timestamp()}_{sender}.{ext}"
        filepath = f"uploads/{filename}"
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_path = filepath
    msg = {"sender": sender, "receiver": receiver, "text": text, "image": image_path, "timestamp": str(datetime.now()), "sender_profile_pic": users.get(sender,{}).get("profile_pic","")}
    messages.append(msg)
    return {"success": True, "message": msg}

# دریافت پیام‌ها
@app.get("/api/get-messages/{user}/{other}")
def get_messages(user: str, other: str):
    user_msgs = [m for m in messages if (m['sender']==user and m['receiver']==other) or (m['sender']==other and m['receiver']==user)]
    return {"messages": user_msgs}

# حذف پیام تک
@app.post("/api/delete-message")
def delete_message(sender: str = Form(...), receiver: str = Form(...), timestamp: str = Form(...)):
    global messages
    messages = [m for m in messages if not ((m['sender']==sender and m['receiver']==receiver and m['timestamp']==timestamp) or (m['sender']==receiver and m['receiver']==sender and m['timestamp']==timestamp))]
    return {"success": True}

# حذف همه پیام‌ها
@app.post("/api/delete-all")
def delete_all(sender: str = Form(...), receiver: str = Form(...)):
    global messages
    messages = [m for m in messages if not ((m['sender']==sender and m['receiver']==receiver) or (m['sender']==receiver and m['receiver']==sender))]
    return {"success": True}
