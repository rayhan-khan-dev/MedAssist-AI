import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle

# models ফোল্ডার তৈরি নিশ্চিত করা
os.makedirs('../models', exist_ok=True)

# ==========================================
# ১. ডায়াবেটিস মডেল ট্রেইনিং (UCI Pima Dataset)
# ==========================================
print("Diabetes মডেল ট্রেইনিং শুরু হচ্ছে...")
# সরাসরি ইন্টারনেট লিংক থেকে স্ট্যান্ডার্ড Pima ডাটাসেট লোড করা
diabetes_url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"
diabetes_cols = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age', 'Outcome']
df_diabetes = pd.read_csv(diabetes_url, names=diabetes_cols)

X_dia = df_diabetes.drop('Outcome', axis=1)
y_dia = df_diabetes['Outcome']

# ডেটা স্প্লিট ও ট্রেইনিং
X_train_dia, X_test_dia, y_train_dia, y_test_dia = train_test_split(X_dia, y_dia, test_size=0.2, random_state=42)
diabetes_model = RandomForestClassifier(n_estimators=100, random_state=42)
diabetes_model.fit(X_train_dia, y_train_dia)

# মডেল সেভ করা
with open('../models/diabetes_model.pkl', 'wb') as f:
    pickle.dump(diabetes_model, f)
print("✅ Diabetes মডেল সফলভাবে ট্রেইনড এবং saved হয়েছে '../models/diabetes_model.pkl' হিসেবে।")


# ==========================================
# ২. হার্ট ডিজিজ মডেল ট্রেইনিং (UCI Cleveland Dataset)
# ==========================================
print("\nHeart Disease মডেল ট্রেইনিং শুরু হচ্ছে...")
heart_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
heart_cols = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
df_heart = pd.read_csv(heart_url, names=heart_cols, na_values="?")

# মিসিং ভ্যালু ক্লিন করা (সহজ পদ্ধতিতে মোড/মিডিয়ান দিয়ে পূরণ)
df_heart.fillna(df_heart.median(), inplace=True)

# target কলামকে বাইনারি করা (০ = নো রিস্ক, ১ বা তার বেশি = রিস্ক)
df_heart['target'] = df_heart['target'].apply(lambda x: 1 if x > 0 else 0)

X_heart = df_heart.drop('target', axis=1)
y_heart = df_heart['target']

# ডেটা স্প্লিট ও ট্রেইনিং
X_train_hrt, X_test_hrt, y_train_hrt, y_test_hrt = train_test_split(X_heart, y_heart, test_size=0.2, random_state=42)
heart_model = RandomForestClassifier(n_estimators=100, random_state=42)
heart_model.fit(X_train_hrt, y_train_hrt)

# মডেল সেভ করা
with open('../models/heart_model.pkl', 'wb') as f:
    pickle.dump(heart_model, f)
print("✅ Heart Disease মডেল সফলভাবে ট্রেইনড এবং saved হয়েছে '../models/heart_model.pkl' হিসেবে।")