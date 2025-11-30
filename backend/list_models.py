#!/usr/bin/env python3
"""
사용 가능한 Gemini 모델 목록 확인
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# 환경변수 로드
load_dotenv()

# API 키 설정
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ API 키가 설정되지 않았습니다.")
    exit(1)

genai.configure(api_key=api_key)

print("🔍 사용 가능한 Gemini 모델 목록:\n")

# 모든 모델 나열
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✅ {model.name}")
        print(f"   - Display Name: {model.display_name}")
        print(f"   - Description: {model.description[:100] if model.description else 'N/A'}...")
        print(f"   - Input Token Limit: {model.input_token_limit}")
        print(f"   - Output Token Limit: {model.output_token_limit}")
        print()

print("\n💡 추천 모델:")
print("   - gemini-1.5-flash: 빠른 응답, 효율적")
print("   - gemini-1.5-pro: 고품질 응답, 복잡한 작업")
print("   - gemini-pro: 균형잡힌 성능")