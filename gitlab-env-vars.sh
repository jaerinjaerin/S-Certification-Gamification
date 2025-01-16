#!/usr/bin/env bash

################################################################################
# Usage:
#   ./gitlab-env-vars.sh <ENV_SCOPE> <ENV_FILE>
#
# 예시:
#   ./gitlab-env-vars.sh staging .env.stg
#   ./gitlab-env-vars.sh production .env.prd
#
# 설명:
#   - 첫 번째 인자로 ENV_SCOPE를 직접 지정 (예: "staging", "production")
#   - 두 번째 인자로 로드할 .env 파일의 경로를 지정
################################################################################

# 1) 스크립트 인자 확인
if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <ENV_SCOPE> <ENV_FILE>"
  echo "예시: $0 staging .env.stg"
  echo "       $0 production .env.prd"
  exit 1
fi

# 2) 인자값을 ENV_SCOPE와 ENV_FILE에 할당
ENV_SCOPE="$1"
ENV_FILE="$2"

# 3) .env 파일 존재 여부 확인
if [ ! -f "$ENV_FILE" ]; then
  echo "에러: 파일 '$ENV_FILE' 이(가) 없습니다."
  exit 1
fi

# 4) GitLab 정보 설정 (필요에 따라 수정)
TOKEN="glpat-3zXk2Fzs32xE5zt1P5WW"             # Personal Access Token (api 권한 필요)
PROJECT_ID="189" # GitLab 프로젝트 ID 또는 namespace/project
GITLAB_URL="http://git.bien.ltd:14500/"        # GitLab 인스턴스 URL

# 5) .env 파일에서 키-값 쌍을 읽어 연관 배열에 저장
declare -A ENV_VARIABLES=()

# IFS='' 를 통해, 라인 앞뒤에 공백이 있어도 그대로 읽음
# "|| [[ -n $line ]]" 은 파일의 마지막 줄이 공백이어도 정상 처리하도록 함
while IFS='' read -r line || [[ -n "$line" ]]; do

  # 빈 줄 혹은 '#' 로 시작하는 주석은 무시
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi

  # "KEY=VALUE" 형태로 파싱
  IFS='=' read -r KEY VALUE <<< "$line"

  # 앞뒤 공백 제거
  KEY="$(echo -e "${KEY}" | sed -e 's/^[[:space:]]*//g' -e 's/[[:space:]]*$//g')"
  VALUE="$(echo -e "${VALUE}" | sed -e 's/^[[:space:]]*//g' -e 's/[[:space:]]*$//g')"

  # VALUE에서 쌍따옴표 제거
  VALUE="$(echo "$VALUE" | sed -e 's/^"//' -e 's/"$//')"

  # 연관 배열에 저장
  ENV_VARIABLES["$KEY"]="$VALUE"
done < "$ENV_FILE"

# 6) GitLab API 호출: 저장된 Key-Value 쌍을 반복 등록
success_count=0

for KEY in "${!ENV_VARIABLES[@]}"; do
  VALUE="${ENV_VARIABLES[$KEY]}"

  echo "Registering variable: [$ENV_SCOPE] $KEY = $VALUE"

  # curl을 사용하여 API 호출, HTTP 상태 코드 캡처
  RESPONSE=$(curl --request POST \
    --silent \
    --header "PRIVATE-TOKEN: $TOKEN" \
    --header "Content-Type: application/json" \
    --data "{
      \"key\": \"$KEY\",
      \"value\": \"$VALUE\",
      \"environment_scope\": \"$ENV_SCOPE\",
      \"masked\": false,
      \"protected\": false
    }" \
    --write-out "HTTPSTATUS:%{http_code}" \
    "$GITLAB_URL/api/v4/projects/$PROJECT_ID/variables")

  # 응답에서 HTTP 상태 코드 분리
  HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTPSTATUS\:.*//g')
  HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

  # 상태 코드에 따라 성공 여부 판단
  if [[ "$HTTP_STATUS" -ge 200 && "$HTTP_STATUS" -lt 300 ]]; then
    echo "성공적으로 등록됨: $KEY"
    ((success_count++))
  else
    echo "에러 발생: $KEY 등록 실패 (HTTP 상태 코드: $HTTP_STATUS)"
    echo "응답 내용: $HTTP_BODY"
  fi

done

echo "완료! '$ENV_FILE' 파일에서 '$ENV_SCOPE' 스코프에 $success_count 개의 변수가 성공적으로 등록되었습니다."
