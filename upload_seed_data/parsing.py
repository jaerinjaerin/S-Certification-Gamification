import pandas as pd
import json

# 엑셀 파일 경로 설정
file_path = 'data.xlsx'

# 엑셀 파일 읽기
df = pd.read_excel(file_path, sheet_name='Sheet1')

# 열 이름의 앞뒤 공백 제거
df.columns = df.columns.str.strip()

# 필요한 열 선택 및 결측값 제거
columns = ['No','Question', 'Product', 'Category', 'SpecificFeature', 'Domain', 'DomainCode', 'Lang', 'Answer', 'TimeLimitSeconds']
df = df[columns].dropna(subset=['Question', 'Answer'])

# 인덱스 재설정
df = df.reset_index(drop=True)

# JSON 데이터 생성
questions = []
for index, row in df.iterrows():
    question = {
        "text": row['Question'],
        "product": row['Product'],
        "category": row['Category'],
        "feature": row['SpecificFeature'],
        "domain": row['Domain'],
        "domainCode": row['DomainCode'],
        "order": row['No'],
        "languageCode": row['Lang'],
        "timeLimitSeconds": row['TimeLimitSeconds'],
        "options": [
            {"optionText": row['Answer'], "isCorrect": True}
            # 추가 옵션이 있다면 여기에 추가
        ]
    }
    questions.append(question)

# JSON 파일로 저장
with open('questions.json', 'w', encoding='utf-8') as json_file:
    json.dump(questions, json_file, ensure_ascii=False, indent=4)

print("JSON 파일이 성공적으로 생성되었습니다.")
