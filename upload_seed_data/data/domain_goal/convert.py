import pandas as pd
import json

# 새로 업로드된 파일 경로
file_path = "domain_target.xlsx"

# 엑셀 파일 다시 로드
xls = pd.ExcelFile(file_path)

# 'Sheet' 시트에서 데이터 로드 (첫 번째 행을 헤더로 인식)
df_data = xls.parse('Sheet', header=0)

# 실제 컬럼명 확인
print("엑셀에서 로드된 컬럼:", df_data.columns.tolist())

# 컬럼 개수 확인 후 필요 없는 컬럼 제거
expected_columns = ['Country', 'ID', 'FSM(SES)', 'FSM', 'FF(SES)', 'FF']

# 실제 엑셀에 없는 컬럼을 제외하고 선택
df_data = df_data[[col for col in expected_columns if col in df_data.columns]]

# ID가 없는 행 제거 (NaN 또는 빈 문자열인 경우 제외)
df_data = df_data.dropna(subset=['ID'])
df_data = df_data[df_data['ID'].astype(str).str.strip() != ""]  # 빈 문자열 제거

# NaN 값 0으로 변환
df_data = df_data.fillna(0)

# 'FF'를 제외한 나머지 값을 반올림 (소수점 첫째 자리에서 반올림)
df_data['FF'] = df_data['FF'].apply(lambda x: round(x) if isinstance(x, (int, float)) else x)
df_data['FSM(SES)'] = df_data['FSM(SES)'].apply(lambda x: round(x) if isinstance(x, (int, float)) else x)
df_data['FSM'] = df_data['FSM'].apply(lambda x: round(x) if isinstance(x, (int, float)) else x)
df_data['FF(SES)'] = df_data['FF(SES)'].apply(lambda x: round(x) if isinstance(x, (int, float)) else x)

# ID를 키로 JSON 변환
data_dict = {
    row['ID']: {
        'ff': row['FF'],  # 'FF'는 그대로
        'fsm': row['FSM'],  # 반올림 처리됨
        'ffSes': row['FF(SES)'],  # 반올림 처리됨
        'fsmSes': row['FSM(SES)']  # 반올림 처리됨
    }
    for _, row in df_data.iterrows()
}

# JSON 파일로 저장
json_file_path = "domain_target.json"

with open(json_file_path, "w", encoding="utf-8") as f:
    json.dump(data_dict, f, ensure_ascii=False, indent=4)

# 최종 합산 계산
total_ff = df_data['FF'].sum()
total_fsm = df_data['FSM'].sum()
total_ffSes = df_data['FF(SES)'].sum()
total_fsmSes = df_data['FSM(SES)'].sum()
total_sum = total_ff + total_fsm + total_ffSes + total_fsmSes

# 최종 합산 출력
print(f"Total FF: {total_ff}")
print(f"Total FSM: {total_fsm}")
print(f"Total FF(SES): {total_ffSes}")
print(f"Total FSM(SES): {total_fsmSes}")
print(f"Total Sum: {total_sum}")

# 저장된 JSON 파일 경로 반환
json_file_path
