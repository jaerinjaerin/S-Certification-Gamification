import os
from openpyxl import load_workbook
import pandas as pd
import json

# 입력 및 출력 디렉토리 설정
input_dir = "data/origins"
output_dir = "data/questions"

# 출력 디렉토리가 없으면 생성
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 파일 처리 함수 정의
def process_excel(file_path, output_path):
    workbook = load_workbook(file_path)
    sheet = workbook.active

    # 병합된 셀 정보 가져오기
    merged_cells = sheet.merged_cells.ranges
    merged_data = {}
    for merge_range in merged_cells:
        top_left_cell = merge_range.start_cell
        value = sheet[top_left_cell.coordinate].value
        for row in sheet.iter_rows(min_row=merge_range.min_row, max_row=merge_range.max_row,
                                   min_col=merge_range.min_col, max_col=merge_range.max_col):
            for cell in row:
                merged_data[cell.coordinate] = value

    # 데이터프레임으로 변환
    data = []
    for row in sheet.iter_rows():  # values_only=True 제거
        row_data = []
        for cell in row:
            cell_value = merged_data.get(cell.coordinate, cell.value)  # 병합된 값 적용
            row_data.append(cell_value)
        data.append(row_data)

    df = pd.DataFrame(data)

    # 첫 번째 행을 헤더로 설정
    df.columns = df.iloc[0]
    df = df[1:].reset_index(drop=True)

    # "No" 열이 숫자인지 확인 및 변환
    df["No"] = pd.to_numeric(df["No"], errors="coerce")

    # "No" 열 기준으로 그룹화 및 JSON 변환
    grouped_data = df.groupby("No").apply(lambda group: {
        "originQuestionIndex": group.name,  # 그룹화 기준 키 값을 사용
        "orderInStage": group["New No."].iloc[0] if "New No." in group else None,
        "enabled": group["Enabled"].iloc[0] if "Enabled" in group else None,
        "stage": group["Stage"].iloc[0] if "Stage" in group else None,
        "product": group["Product"].iloc[0] if "Product" in group else None,
        "category": group["Category"].iloc[0] if "Category" in group else None,
        "specificFeature": group["SpecificFeature"].iloc[0] if "SpecificFeature" in group else None,
        "importance": group["Importance"].iloc[0] if "Importance" in group else None,
        "timeLimitSeconds": group["TimeLimitSeconds"].iloc[0] if "TimeLimitSeconds" in group else None,
        "text": group["Question"].iloc[0] if "Question" in group else None,
        "questionType": group["QuestionType"].iloc[0] if "QuestionType" in group else None,
        "options": [
            {
                "text": row["Answer"] if "Answer" in row else None,
                "answerStatus": row["AnswerStatus"] if "AnswerStatus" in row else None,
            }
            for _, row in group.iterrows()
        ]
    }).tolist()

    # JSON 파일로 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(grouped_data, f, ensure_ascii=False, indent=2)

# origins 디렉토리의 모든 엑셀 파일 처리
for file_name in os.listdir(input_dir):
    if file_name.endswith(".xlsx"):
        # 파일명 처리: "sample.NAT_021502.fi.xlsx" -> "NAT_021502.fi.json"
        parts = file_name.split(".")
        if len(parts) > 2:  # 파일명이 "sample.NAT_021502.fi.xlsx" 구조라고 가정
            output_file_name = ".".join(parts[1:]).replace(".xlsx", ".json")  # 첫 부분 제외
            input_path = os.path.join(input_dir, file_name)
            output_path = os.path.join(output_dir, output_file_name)

            # 엑셀 파일 처리
            process_excel(input_path, output_path)
            print(f"Processed: {file_name} -> {output_file_name}")

print("모든 파일이 변환되었습니다.")
