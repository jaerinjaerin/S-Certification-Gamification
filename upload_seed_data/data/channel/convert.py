import json

# JSON 파일을 읽고 변환하는 함수
def transform_json_to_data(input_file, output_file):
    with open(input_file, 'r') as file:
        data = json.load(file)

    # 데이터를 변환
    transformed_data = []
    for item in data["items"]:
        subsidiary = item.get("subsidiary", {})
        region = subsidiary.get("region") if subsidiary else None
        
        transformed_item = {
            "id": item["id"],
            "name": item["name"],
            "code": item["code"],
            "subsidiaryId": item.get("subsidiaryId"),
            "subsudiaryId": item.get("subsidiaryId"),  # typo 유지
            "regionId": region["id"] if region else None,  # 지역 ID 가져오기
            "channels": []
        }
        transformed_data.append(transformed_item)

    # 변환된 데이터를 JSON 파일로 저장
    with open(output_file, 'w') as file:
        json.dump(transformed_data, file, indent=4)

    print(f"Transformed data saved to {output_file}")

# 사용 예시
input_json_file = "domains.json"  # 입력 JSON 파일 경로
output_json_file = "channels_source.json"  # 출력 JSON 파일 경로
transform_json_to_data(input_json_file, output_json_file)
