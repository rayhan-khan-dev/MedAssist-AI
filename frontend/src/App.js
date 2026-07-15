import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aiReport, setAiReport] = useState("");

  const [profile, setProfile] = useState({
    gender: "Male",
    age: 21,
    occupation: "Student",
    height: 175,
    habit: "None",
    pre_conditions: [],
  });

  const [diabetesData, setDiabetesData] = useState({
    Pregnancies: 0,
    Glucose: 120,
    BloodPressure: 80,
    SkinThickness: 20,
    Insulin: 79,
    BMI: 25,
    DiabetesPedigreeFunction: 0.5,
    Age: 30,
  });
  const [heartData, setHeartData] = useState({
    age: 45,
    sex: 1,
    cp: 1,
    trestbps: 130,
    chol: 240,
    fbs: 0,
    restecg: 1,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 1,
    ca: 0,
    thal: 2,
  });
  const [skinFile, setSkinFile] = useState(null);

  const handleProfileCheck = (cond) => {
    const updated = profile.pre_conditions.includes(cond)
      ? profile.pre_conditions.filter((c) => c !== cond)
      : [...profile.pre_conditions, cond];
    setProfile({ ...profile, pre_conditions: updated });
  };

  useEffect(() => {
    if (token && activeTab === "history") {
      axios
        .get(`https://medassist-ai.onrender.com/history/${username}`)
        .then((res) => setHistoryData(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeTab, token, username]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post(
          "https://medassist-ai.onrender.com/auth/register",
          authForm,
        );
        alert("Registration Successful!");
        setIsRegister(false);
      } else {
        const res = await axios.post(
          "https://medassist-ai.onrender.com/auth/login",
          {
            email: authForm.email,
            password: authForm.password,
          },
        );
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("username", res.data.username);
        setToken(res.data.access_token);
        setUsername(res.data.username);
      }
    } catch (err) {
      alert("Authorization Error!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUsername("");
  };

  const checkDiabetes = async () => {
    setLoading(true);
    setResult(null);
    setAiReport("");
    try {
      // ডাইরেক্ট ডেটা অবজেক্ট পাসিং
      const res = await axios.post(
        "https://medassist-ai.onrender.com/predict/diabetes",
        diabetesData,
      );
      const condition = res.data.risk_detected ? "High Risk" : "Low Risk";

      // স্টেট আপডেট
      setResult({
        type: "Diabetes Risk Matrix",
        risk_score: res.data.risk_score,
        condition_detected: condition,
      });

      // রিপোর্ট জেনারেশন পাইপলাইন ফায়ার
      await triggerReportPipeline(
        "Diabetes Assessment",
        res.data.risk_score,
        condition,
      );
    } catch (err) {
      alert("Diabetes Pipeline Execution Error");
      setLoading(false);
    }
  };

  const checkHeart = async () => {
    setLoading(true);
    setResult(null);
    setAiReport("");
    try {
      // ডাইরেক্ট ডেটা অবজেক্ট পাসিং
      const res = await axios.post(
        "https://medassist-ai.onrender.com/predict/heart",
        heartData,
      );
      const condition = res.data.risk_detected ? "High Risk" : "Low Risk";

      // স্টেট আপডেট
      setResult({
        type: "Cardiovascular Risk Matrix",
        risk_score: res.data.risk_score,
        condition_detected: condition,
      });

      // রিপোর্ট জেনারেশন পাইপলাইন ফায়ার
      await triggerReportPipeline(
        "Heart Disease Assessment",
        res.data.risk_score,
        condition,
      );
    } catch (err) {
      alert("Heart Pipeline Execution Error");
      setLoading(false);
    }
  };

  const checkSkin = async () => {
    if (!skinFile) return alert("Upload Image first!");
    setLoading(true);
    setResult(null);
    setAiReport("");
    const formData = new FormData();
    formData.append("file", skinFile);
    try {
      const res = await axios.post(
        "https://medassist-ai.onrender.com/predict/skin",
        formData,
      );
      setResult({
        type: "Dermatological Analysis",
        risk_score: res.data.confidence,
        condition_detected: res.data.condition,
      });
      await triggerReportPipeline(
        "Skin Screening",
        res.data.confidence,
        res.data.condition,
      );
    } catch (err) {
      alert("Execution Error");
      setLoading(false);
    }
  };

  const triggerReportPipeline = async (type, score, condition) => {
    try {
      const reportRes = await axios.post(
        "https://medassist-ai.onrender.com/ai/generate-report",
        {
          test_type: type,
          risk_score: score,
          condition_detected: condition,
          profile: profile,
        },
      );
      setAiReport(reportRes.data.bengali_report);
      await axios.post("https://medassist-ai.onrender.com/history/save", {
        username: username,
        test_type: type,
        risk_score: score,
        condition: condition,
        report: reportRes.data.bengali_report,
      });
    } catch (err) {
      setAiReport("Failed to sync matrix arrays.");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center font-sans">
        <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              MedAssist Core
            </h2>
          </div>
          <form
            onSubmit={handleAuthSubmit}
            className="flex flex-col gap-4 text-slate-300"
          >
            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  onChange={(e) =>
                    setAuthForm({ ...authForm, username: e.target.value })
                  }
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Email / User Gateway
              </label>
              <input
                type="email"
                name="email"
                required
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Secure Encryption Key
              </label>
              <input
                type="password"
                name="password"
                required
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl mt-4 transition"
            >
              {isRegister
                ? "Register Core Node"
                : "Authorize & Launch Platform"}
            </button>
          </form>
          <p className="text-sm text-center text-slate-400 mt-6">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-teal-400 font-bold hover:underline"
            >
              {isRegister ? "Authorize Gateway" : "Provision New Account"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-200 font-sans tracking-wide">
      {/* Sidebar UI */}
      <aside className="w-80 bg-[#111827] border-r border-slate-800/80 p-5 flex flex-col justify-between hidden lg:flex">
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[85vh] pr-1">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl bg-slate-900 p-2 rounded-xl border border-slate-800 text-teal-400">
              🩺
            </span>
            <div>
              <h2 className="text-sm font-black text-white">MedAssist CDSS</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Control Core Panel
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
              Navigation Stack
            </span>
            {["dashboard", "diabetes", "heart", "skin", "history"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setResult(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition flex items-center gap-3 ${activeTab === tab ? "bg-gradient-to-r from-teal-600/20 to-blue-600/20 text-teal-400 border border-teal-500/30" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
                >
                  <span>
                    {tab === "dashboard"
                      ? "📊"
                      : tab === "diabetes"
                        ? "🩸"
                        : tab === "heart"
                          ? "❤️"
                          : tab === "skin"
                            ? "🔍"
                            : "📜"}
                  </span>
                  {tab === "history" ? "Logs Audit" : tab}
                </button>
              ),
            )}
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
              Personal Settings
            </span>
            <div className="bg-[#090d16]/50 p-3.5 rounded-xl border border-slate-800/60 flex flex-col gap-2">
              <div className="text-xs">
                <span className="text-slate-500">Name:</span>{" "}
                <span className="font-bold text-white font-mono">
                  {username}
                </span>
              </div>
              <button
                onClick={() => alert("Credentials Node Active")}
                className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-300"
              >
                Update Credentials
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
              Patient Bio-Variables
            </span>
            <div className="flex flex-col gap-3 bg-[#090d16]/30 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  className="w-full bg-[#1f2937] border border-slate-800 p-2 rounded-lg text-white outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Age Index
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#1f2937] border border-slate-800 p-2 rounded-lg text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Occupation
                </label>
                <select
                  value={profile.occupation}
                  onChange={(e) =>
                    setProfile({ ...profile, occupation: e.target.value })
                  }
                  className="w-full bg-[#1f2937] border border-slate-800 p-2 rounded-lg text-white outline-none"
                >
                  <option value="Student">Student (UIU Node)</option>
                  <option value="Day Laborer">Day Laborer</option>
                  <option value="Desk Job / Sedentary">
                    Desk Job / Sedentary
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      height: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#1f2937] border border-slate-800 p-2 rounded-lg text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Habits
                </label>
                <select
                  value={profile.habit}
                  onChange={(e) =>
                    setProfile({ ...profile, habit: e.target.value })
                  }
                  className="w-full bg-[#1f2937] border border-slate-800 p-2 rounded-lg text-white outline-none"
                >
                  <option value="None">None</option>
                  <option value="Smoking">Smoking</option>
                  <option value="Sedentary">Alcohol / High Stress</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Pre-Conditions
                </label>
                <div className="flex flex-col gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {["Diabetes", "Hypertension", "Kidney History"].map(
                    (cond) => (
                      <label
                        key={cond}
                        className="flex items-center gap-2 cursor-pointer hover:text-white text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={profile.pre_conditions.includes(cond)}
                          onChange={() => handleProfileCheck(cond)}
                          className="rounded accent-teal-500 bg-slate-900"
                        />
                        <span>{cond}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-2.5 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs font-bold rounded-xl transition uppercase tracking-wider"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Framework Layout Container */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-[#111827] border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setActiveTab("dashboard");
              setResult(null);
            }}
          >
            <span className="text-xl">🩺</span>
            <span className="text-md font-black tracking-tight text-white">
              MEDASSIST CDSS
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold px-3 py-1.5 border border-slate-800 rounded-lg bg-slate-900 text-rose-400"
          >
            Sign Out
          </button>
        </header>

        <main className="p-8 max-w-5xl w-full mx-auto flex-1">
          {loading && (
            <div className="text-center py-20 bg-[#111827] border border-slate-800 rounded-2xl animate-pulse max-w-xl mx-auto">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400 mx-auto mb-4"></div>
              <p className="text-xs text-slate-400">
                Processing Node Grid Array...
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn mb-8">
              <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-fit">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">
                    {result.type}
                  </h4>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-4">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Risk confidence:
                    </span>
                    <span className="text-3xl font-black font-mono text-rose-400">
                      {result.risk_score || result.confidence}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300"
                >
                  Reset View
                </button>
              </div>
              <div className="lg:col-span-2 bg-[#111827] border border-slate-800 p-6 rounded-2xl border-t-2 border-t-teal-500 shadow-2xl">
                <div className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-line bg-slate-900/40 p-5 rounded-xl border border-slate-900 tracking-normal">
                  {aiReport}
                </div>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && !result && !loading && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setActiveTab("diabetes")}
                  className="relative group overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-8 cursor-pointer shadow-xl min-h-[220px] flex flex-col justify-between"
                >
                  <div className="text-4xl bg-red-950/40 p-4 rounded-2xl border border-red-900/30 text-red-400 w-fit">
                    🩸
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">
                      Diabetes Screening Panel
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pipes parameters into deep conditional cross-mapping tree
                      rules.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("heart")}
                  className="relative group overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-8 cursor-pointer shadow-xl min-h-[220px] flex flex-col justify-between"
                >
                  <div className="text-4xl bg-pink-950/40 p-4 rounded-2xl border border-pink-900/30 text-pink-400 w-fit">
                    ❤️
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">
                      Cardiovascular Risk Matrix
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cleveland biomarkers assessment matching lifestyle tobacco
                      anomalies.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("skin")}
                className="relative group overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] p-8 cursor-pointer shadow-xl min-h-[180px] flex flex-col justify-between"
              >
                <div className="text-4xl bg-teal-950/40 p-4 rounded-2xl border border-teal-900/30 text-teal-400 w-fit">
                  🔍
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-black text-white tracking-tight mb-2">
                    Neural Cutaneous Skin Texture Pipeline
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Converts structural dermatological cell arrays into
                    real-time CNN predictions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "diabetes" && !result && !loading && (
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl max-w-2xl mx-auto animate-fadeIn">
              <h3 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">
                🩸 UCI Pima Dataset Fields Mapping
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {Object.keys(diabetesData).map((k) => (
                  <div key={k} className="flex flex-col">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">
                      {k}
                    </label>
                    <input
                      type="number"
                      value={diabetesData[k]}
                      onChange={(e) =>
                        setDiabetesData({
                          ...diabetesData,
                          [k]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={checkDiabetes}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold rounded-xl uppercase"
              >
                Compute Diagnostic Probability
              </button>
            </div>
          )}

          {activeTab === "heart" && !result && !loading && (
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl max-w-3xl mx-auto animate-fadeIn">
              <h3 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">
                ❤️ UCI Cleveland Clinical Metrics Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {Object.keys(heartData).map((k) => (
                  <div key={k} className="flex flex-col">
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">
                      {k}
                    </label>
                    <input
                      type="number"
                      value={heartData[k]}
                      onChange={(e) =>
                        setHeartData({
                          ...heartData,
                          [k]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={checkHeart}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold rounded-xl uppercase"
              >
                Compute Cardiovascular Pipeline
              </button>
            </div>
          )}

          {activeTab === "skin" && !result && !loading && (
            <div className="bg-[#111827] border border-slate-800 p-8 rounded-2xl text-center max-w-md mx-auto animate-fadeIn">
              <h3 className="text-sm font-bold text-white mb-4">
                Neural Cutaneous Classification Layer
              </h3>
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 bg-slate-900/40 mb-6 flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSkinFile(e.target.files[0])}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-teal-400 font-mono cursor-pointer"
                />
              </div>
              <button
                onClick={checkSkin}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold rounded-xl uppercase"
              >
                Run CNN Screening Node
              </button>
            </div>
          )}

          {activeTab === "history" && !result && !loading && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
                <h3 className="text-sm font-bold text-white">
                  SQLite Persistence Layer Active Logs History
                </h3>
              </div>
              {historyData.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#111827] border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col md:flex-row gap-5 border-l-2 border-l-teal-500"
                >
                  <div className="w-full md:w-1/4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono uppercase">
                        {item.timestamp}
                      </span>
                      <h4 className="text-xs font-black text-white mt-1">
                        {item.test_type}
                      </h4>
                    </div>
                    <div className="mt-3">
                      <span className="text-xl font-bold text-teal-400 font-mono block">
                        {item.risk_score}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-900/20 p-4 rounded-lg border border-slate-900 font-mono tracking-normal">
                    {item.report}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
