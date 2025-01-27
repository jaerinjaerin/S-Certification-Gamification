import os
import re

# 경로 설정
folder1 = "jsons"  # NAT_120.json 파일들이 있는 폴더
folder2 = "markdowns"  # {Albania}.{NAT_2008}.{sq}.T&C.md 파일들이 있는 폴더

pattern1 = r"(NAT_\d+)\.json"  # NAT_120.json 에서 NAT_120 추출
pattern2 = r"\{.*?\}\.\{(NAT_\d+)\}\.\{.*?\}(?:_PP|\.T&C\.md)$"  # {Algeria}.{NAT_2012}.{fr-FR}_PP 또는 .T&C.md 에서 NAT_2012 추출

def extract_from_folder(folder_path, pattern):
    extracted = set()
    for filename in os.listdir(folder_path):
        match = re.search(pattern, filename)
        if match:
            extracted.add(match.group(1))
    return extracted

def extract_second_part(folder_path):
    extracted = set()
    try:
        for filename in os.listdir(folder_path):
            # { 와 } 제거
            cleaned_filename = filename.replace("{", "").replace("}", "")
            parts = cleaned_filename.split(".")  # .으로 분리
            if len(parts) > 1:  # 두 번째 부분이 존재하는지 확인
                extracted.add(parts[1])  # 두 번째 항목 추가
            else:
                print(f"Invalid filename format: {filename}")  # 디버깅 출력
    except FileNotFoundError:
        print(f"Folder not found: {folder_path}")
    return extracted

# 파일명에서 값을 추출
nat_from_folder1 = extract_from_folder(folder1, pattern1)
nat_from_folder2 = extract_second_part(folder2)

# 서로 없는 값 계산
only_in_folder1 = nat_from_folder1 - nat_from_folder2
only_in_folder2 = nat_from_folder2 - nat_from_folder1

# 결과 출력
print("Only in folder1:", sorted(only_in_folder1))
print("Only in folder2:", sorted(only_in_folder2))
