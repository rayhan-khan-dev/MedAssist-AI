import hashlib
import sqlite3
from datetime import datetime, timedelta
from jose import jwt
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

app = FastAPI()

# 🌐 সলিড ওয়াইল্ডকার্ড পারমিশন উইথ ক্রেডেনশিয়ালস হ্যান্ডলিং
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://med-assist-ai-six.vercel.app"  # আপনার আসল Vercel লিংকটি এখানে বসবে
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_NAME = "medassist.db"
SECRET_KEY = "SUPER_SECRET_KEY_FOR_MEDASSIST_AI_CSE"
ALGORITHM = "HS256"

def hash_password(password: str):
    salt = "medassist_secure_salt_2026"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=2)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            test_type TEXT NOT NULL,
            risk_score REAL NOT NULL,
            condition TEXT NOT NULL,
            report TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

class RegisterSchema(BaseModel):
    username: str; email: str; password: str

class LoginSchema(BaseModel):
    email: str; password: str

class SaveHistorySchema(BaseModel):
    username: str; test_type: str; risk_score: float; condition: str; report: str

class PatientProfile(BaseModel):
    gender: str
    age: int
    occupation: str
    height: float
    habit: str
    pre_conditions: list

class ReportRequest(BaseModel):
    test_type: str
    risk_score: float
    condition_detected: str
    profile: PatientProfile

@app.post("/auth/register")
def register_user(user: RegisterSchema):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    try:
        hashed_pwd = hash_password(user.password)
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
                       (user.username.strip(), user.email.strip().lower(), hashed_pwd))
        conn.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username or Email already exists!")
    finally: conn.close()

@app.post("/auth/login")
def login_user(user: LoginSchema):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password FROM users WHERE email = ? OR username = ?", (user.email.strip().lower(), user.email.strip()))
    db_user = cursor.fetchone()
    conn.close()
    if not db_user or not verify_password(user.password, db_user[2]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = create_access_token({"user_id": db_user[0], "username": db_user[1]})
    return {"success": True, "access_token": token, "username": db_user[1]}

@app.post("/history/save")
def save_history(data: SaveHistorySchema):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    cursor.execute("INSERT INTO history (username, test_type, risk_score, condition, report, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                   (data.username, data.test_type, data.risk_score, data.condition, data.report, now))
    conn.commit()
    conn.close()
    return {"success": True}

@app.get("/history/{username}")
def get_history(username: str):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT test_type, risk_score, condition, report, timestamp FROM history WHERE username = ? ORDER BY id DESC", (username,))
    rows = cursor.fetchall()
    conn.close()
    return [{"test_type": r[0], "risk_score": r[1], "condition": r[2], "report": r[3], "timestamp": r[4]} for r in rows]

class MockModel:
    def predict_proba(self, X): return np.array([[0.22, 0.78]]) if X[0][1] > 140 else np.array([[0.88, 0.12]])
diabetes_model = MockModel()
heart_model = MockModel()

class DiabetesInput(BaseModel):
    Pregnancies: float; Glucose: float; BloodPressure: float; SkinThickness: float; Insulin: float; BMI: float; DiabetesPedigreeFunction: float; Age: float

class HeartInput(BaseModel):
    age: float; sex: float; cp: float; trestbps: float; chol: float; fbs: float; restecg: float; thalach: float; exang: float; oldpeak: float; slope: float; ca: float; thal: float

# 🛠️ এই দুটি রাউটকে এভাবে আপডেট করুন যেন তারা এক্সট্রা প্রোফাইল ডেটা আসলেও ক্র্যাশ না করে:

@app.post("/predict/diabetes")
def predict_diabetes(data: dict):
    # ফ্রন্টএন্ড থেকে পাঠানো ডিকশনারি থেকে ডেটা সেফলি রিড করা হচ্ছে
    glucose = data.get("Glucose", 120)
    risk_prob = 78.5 if glucose > 140 else 12.4
    return {"risk_score": round(risk_prob, 2), "risk_detected": risk_prob > 50}

@app.post("/predict/heart")
def predict_heart(data: dict):
    # ফ্রন্টএন্ড থেকে পাঠানো ডিকশনারি থেকে ডেটা সেফলি রিড করা হচ্ছে
    thalach = data.get("thalach", 150)
    risk_prob = 82.4 if thalach > 140 else 18.2
    return {"risk_score": round(risk_prob, 2), "risk_detected": risk_prob > 50}

@app.post("/predict/skin")
def predict_skin():
    return {"condition": "Acne", "confidence": 84.5}

@app.post("/ai/generate-report")
def generate_bengali_report(data: ReportRequest):
    try:
        p = data.profile
        score = data.risk_score
        test_lower = data.test_type.lower()
        
        has_diabetes = "Diabetes" in p.pre_conditions
        has_hypertension = "Hypertension" in p.pre_conditions or "Hypertension" in p.pre_conditions
        has_kidney = "Kidney History" in p.pre_conditions
        is_smoker = p.habit == "Smoking"
        is_laborer = p.occupation == "Day Laborer"
        is_sedentary = p.occupation == "Desk Job / Sedentary"

        heading = f"📋 MEDASSIST CDSS EXPERT EVALUATION REPORT\n"
        heading += f"──────────────────────────────────────────────\n"
        patient_meta = (
            f"👤 রুগীর প্রোফাইল: বয়স: {p.age} বছর | লিঙ্গ: {p.gender} | পেশা: {p.occupation}\n"
            f"📏 উচ্চতা ম্যাট্রিক্স: {p.height} cm | লাইফস্টাইল: {p.habit}\n"
            f"⚠️ একটিভ প্রি-কন্ডিশন: {', '.join(p.pre_conditions) if p.pre_conditions else 'নেই'}\n"
            f"🧪 টেস্ট সেগমেন্ট: {data.test_type} | এআই রিস্ক স্কোর: {score}%\n"
            f"──────────────────────────────────────────────\n\n"
        )
        
        body = ""
        if "diabetes" in test_lower:
            body += "🎯 ডায়াবেটিস ও গ্লাইসেমিক ইনডেক্স বিশ্লেষণ:\n"
            if score > 50:
                body += f"🚨 আপনার ডায়াবেটিসের ঝুঁকি অত্যন্ত উচ্চ ({score}%)। এটি একটি স্পর্শকাতর কেস।\n\n"
                if is_laborer:
                    body += "⚠️ পেশা ভিত্তিক বিশেষ পরামর্শ (দিনমজুর কেস):\nPhysical labor এর জন্য শর্করার সোর্স সীমিত রাখুন কিন্তু একবারে বন্ধ করবেন না, যাতে হাইপোগ্লাইসেমিয়া না হয়।\n\n"
                elif is_sedentary:
                    body += "⚠️ ⚠️ পেশা ভিত্তিক বিশেষ পরামর্শ (ডেস্ক জব কেস):\nক্যালোরি বার্ন কম হওয়ায় ভাত, আলু, শর্করা ডায়েট থেকে সম্পূর্ণ লক করা হলো।\n\n"
                if has_hypertension:
                    body += "❌ উচ্চ রক্তচাপের প্রভাবে বাড়তি কাঁচা লবণ সম্পূর্ণ নিষিদ্ধ।\n"
                body += "❌ চিনি, আইসক্রিম, কোমল পানীয় সম্পূর্ণ বর্জন করুন।"
            else:
                body += "Risk স্কোর নিয়ন্ত্রণে রয়েছে।"

        elif "heart" in test_lower:
            body += "🎯 কার্ডিওভাসকুলার ঝুঁকি বিশ্লেষণ:\n"
            if score > 50:
                body += f"🚨 আপনার হার্টের ঝুঁকির ইনডেক্স আশঙ্কাজনক স্তরে রয়েছে ({score}%)।\n\n"
                if has_diabetes:
                    body += "🚨 ডায়াবেটিস ক্রস-কমপ্লিকেশন প্রোটোকল:\nডায়াবেটিস থাকায় মিষ্টি ফল বা উচ্চ গ্লাইসেমিক শর্করা সম্পূর্ণ লক করা হলো। ওটস এবং গ্রিলড ফিশ খান।\n\n"
                if has_hypertension:
                    body += "❌ তরকারিতে লবণ একদম সীমিত করুন এবং কাঁচা লবণ নিষিদ্ধ।\n"
                if is_smoker:
                    body += "🚨 ধূমপান বর্জন নোটিশ: নিকোটিন ধমনীর ব্লকেজ দ্রুত শক্ত করছে, ধূমপান অবিলম্বে বন্ধ করুন।\n"
                body += "❌ চর্বিযুক্ত মাংস (গরু, খাসি), চিংড়ি, ঘি সম্পূর্ণ বন্ধ।"
            else:
                body += "কার্ডিয়াক প্যারামিটার ভালো আছে।"
        else:
            body += "ডার্মাটোলজিক্যাল কন্ডিশন স্বাভাবিক।"

        return {"success": True, "bengali_report": f"{heading}{patient_meta}{body}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))