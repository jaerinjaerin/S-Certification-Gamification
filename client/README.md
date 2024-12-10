## Project Settings

```
$ npx prisma
```

## Prisma Generate

```
$client npm run prisma:generate
```

## DB 확인

```
$ npx prisma studio
```

## Routing 규칙

- app/(client)/[campaign_name]/layout.ts
  - campaign_name으로 유효한 campaign인지 확인. 유효하지 않다면 error/not-found로 랜딩
- app/(client)/[campaign_name]/[quizset_path]/layout.ts
  - quizset_path으로 유효한 quizset인지 확인. 유효하지 않다면 error/not-found로 랜딩
- middleware.ts
  - session이 없는 경우, S+ 유저는 https://example.com/{campaign_name}/{quizset_path}/login 으로 랜딩. S+ 미사용 유저는 https://example.com/{campaign_name}/login으로 랜딩

## 유저에 따른 URL 정보

https://docs.bien.ltd/workspace/b03d84d0-8deb-435f-8ab5-947410d96204/-gmbwVIItKO2j9Qa7esrt

## 디렉토리 구조

app /
├── layout.tsx -> html 및 metadata 정의
├── (client) /
├── [campaign_name] /
├── layout.tsx # CampaignProvider (campaign_name으로 서버에 캠페인 정보 가져와 저장)
├── (auth_guest)
├── login / # quizset_path 없이 접속한 유저는 S+미사용 유저로 취급. 여기서 로그인 시도
├── register / # S+미사용 유저는 로그인 후, 자신의 도메인 및 잡 정보등을 선택하여 서버에 [quizset_path] 정보를 받은 후 퀴즈 페이지로 이동
├── [quizset_path]
├── layout.tsx # QuizProvider, QuizLogProvider (quizset_path로 퀴즈 정보와 유저의 퀴즈 진행상황을 가져와 저장)
├── (auth)
├── login / # Sumtotal 인증을 통해 로그인 시도
├── (quiz)
├── intro / # 퀴즈에 대한 설명 페이지
├── map / # 퀴즈 맵 정보. 현재 유저의 퀴즈 스테이지 정보 노출
├── quiz / # 퀴즈를 진행하는 페이지 (스테이지도 포함)
├── complete / # 퀴즈 완료 페이지

## Route를 처리하는 곳

- middleware.ts
- route/usePathNavigator.ts

## User 데이타가 생성되는 곳

- Sumtotal 인증 유저
  - 유저 생성: auth.ts에서 adapter로 인해 자동 생성.
  - 유저 추가 정보 저장: auth.ts profile 함수에서 accessToken을 이용하여 sumtotal api호출하여 channelSegmentId, storeId, jobId를 얻어 저장함. 이 때, regionId, subsidaryId 정보도 같이 넣어줌
- Sumtotal 미사용 유저
  - 유저 생성: auth.ts CredentialsProvider에서 인증 성공 시, user 가 없는 경우, 생성해줌.
  - 유저 추가 정보 저장: register page에서 유저에게 입력받은 정보를 기반으로, regionId, subsidaryId, channelSegmentId, storeId, channelId를 넣어줌
