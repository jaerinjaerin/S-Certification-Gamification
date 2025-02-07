import pandas as pd
import json

# 새로 업로드된 파일 경로
file_path = "domain_target.xlsx"

# 엑셀 파일 다시 로드
xls = pd.ExcelFile(file_path)

# 'Sheet1 (2)' 시트에서 데이터 로드
df_data = xls.parse('Sheet')

# 컬럼명 정리
df_data.columns = ['Country', 'ID', 'FSM(SES)', 'FSM', 'FF(SES)', 'FF']

# 필요한 컬럼만 유지 ('ID'를 키로, 나머지는 값으로 사용)
df_data = df_data[['ID', 'FSM(SES)', 'FSM', 'FF(SES)', 'FF']].dropna(subset=['ID'])

# ID를 키로 JSON 변환
data_dict = {
    row['ID']: {
        'ff': row['FF'],
        'fsm': row['FSM'],
        'ffSes': row['FF(SES)'],
        'fsmSes': row['FSM(SES)']
    }
    for _, row in df_data.iterrows()
}

# JSON 파일로 저장
json_file_path = "domain_target.json"
import json

with open(json_file_path, "w", encoding="utf-8") as f:
    json.dump(data_dict, f, ensure_ascii=False, indent=4)

# 저장된 JSON 파일 경로 반환
json_file_path
