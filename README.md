# 🏥 MedAssist AI
> **Predict. Detect. Assist.** — An Intelligent Multi-Modal Healthcare Risk Assessment & Computer Vision-Based Skin Screening Platform.

MedAssist AI is a decentralized full-stack web application designed to bridge the gap in preliminary health risk diagnostics. By combining classical Machine Learning (ML) for systemic metabolic markers and Deep Learning (DL) for dermatological scanning, it acts as a non-clinical preliminary screening gateway. It translates raw probability data into highly structured, empathetic native language (Bengali) lifestyle insights using Generative AI.

---

## 🚀 Live Production Gateways
* 🌐 **Live Application URL (Frontend):** https://med-assist-ai-six.vercel.app/
* ⚙️ **Production API Gateway (Backend):** https://medassist-ai-7xzm.onrender.com/
* 📦 **Source Code Repository:** https://github.com/rayhan-khan-dev/MedAssist-AI

---

## 🔑 Evaluator Access & Demo Credentials
To facilitate immediate assessment without undergoing complete sign-up/registration routines, use the pre-initialized production credentials below:
* **Demo Email Gateway:** rayhan.etc.01@gmail.com
* **Secure Access Key:** rayhan1234

---

## ✨ Core Feature Matrices
1. **Systemic Health Risk Node:** Interactive data form mapping essential clinical biometric parameters to calculate probabilistic risk matrices for **Diabetes** and **Heart Disease**.
2. **Computer Vision Screening Node:** Drag-and-drop client dashboard component supporting high-speed image processing for localized **Skin Diseases (Acne, Eczema)**.
3. **Generative Synthesis Explainer:** Deep API integration with the Gemini engine to parse core classification results into a structured dietary/lifestyle guide written in native Bengali.
4. **JWT Session Management:** Secure user registration, sign-up constraints, and persistent analytical state tracking managed via secure tokens.

---

## 🛠️ Technological Ecosystem
* **Frontend UI Matrix:** React.js, Tailwind CSS Framework Architecture
* **Asynchronous Server Routing:** FastAPI (Python Web Runtime)
* **Cloud Database Engine:** Supabase Managed PostgreSQL Instance
* **Core ML Stack:** Scikit-Learn Framework (Random Forest & Logistic Regression Classifiers)
* **Computer Vision Edge:** TensorFlow Core, Keras APIs, MobileNetV2 Topology
* **Generative Layer:** Google Gemini Pro Core API Integration
* **Hosting Cluster:** Vercel (Edge Client Server), Render Cloud Services (Asynchronous API Node)

---

## 📊 AI Models & Evaluated Accuracy
* **Diabetes Prediction Subsystem:** Optimized Random Forest Classifier operating at a target evaluated accuracy of **78%** (Trained on the UCI Pima Indians Dataset).
* **Cardiovascular Risk Subsystem:** L2-Regularized Logistic Regression pipeline maintaining a verified target accuracy of **82%** (Trained on the UCI Cleveland Heart Dataset).
* **Dermatological Analysis Node:** MobileNetV2 architecture with custom Global Average Pooling, a Dense layer (256 units), Dropout (0.5), and a 3-class Softmax layer classifying *Healthy Skin, Acne Vulgaris,* and *Atopic Eczema*.

---

## 💻 Local Infrastructure Setup Instructions

### Pre-requisites
* **Python Environment Runtime:** v3.10 or higher
* **Frontend Client Runtime:** Node.js LTS Version
* **Access Credentials:** Valid Google Gemini API Key

### 1. Backend Microservice Startup
```bash
# Clone the repository and navigate to backend space
git clone [https://github.com/rayhan-khan-dev/MedAssist-AI.git](https://github.com/rayhan-khan-dev/MedAssist-AI.git)
cd MedAssist-AI/backend

# Create virtual environment and activate
python -m venv .venv

# On Windows (PowerShell/CMD):
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install requirements and run server process
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
2. **Client Frontend Execution**
```bash
#Open an isolated command shell window

cd MedAssist-AI/frontend

#Install dependencies and start server node

npm install

npm start

```
---

## ⚠️ Disclaimer
**This application is strictly engineered for educational and preliminary diagnostic screening purposes. It does NOT compute definitive clinical diagnoses, generate official pharmaceutical prescriptions, execute emergency triage operations, or act as a substitute for qualified professional medical advice.**


---


## 📂 System Folder Directory Layout
```text
MedAssist-AI/
├── frontend/                     # Deployed client React application
│   ├── src/
│   │   ├── components/           # Dashboard views, upload fields, auth gateways
│   │   ├── App.js                # Core layout managing live endpoint routes
│   │   └── index.js
│   └── package.json
├── backend/                      # Production FastAPI server runtime
│   ├── app/
│   │   ├── main.py               # Main router incorporating customized CORS mapping
│   │   ├── auth.py               # Cryptographic hashes and JWT key generators
│   │   └── models.py             # Pydantic schemas mapping request criteria
│   └── requirements.txt          # Active production environment dependency file
├── ai/                           # Dedicated model development modules
│   ├── ml/                       # Tabular metrics script utilities
│   ├── cv/                       # Convolutional image processing logic
│   └── notebooks/                # Architectural model training records (.ipynb)
├── models/                       # Pickled production analytical assets
│   ├── diabetes_model.pkl
│   ├── heart_model.pkl
│   └── skin_model.keras
└── README.md                     # Universal continuous installation documentation
