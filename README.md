# 프로젝트 개요

이 저장소는 **퀴즈 서비스(client)**, **CMS**, **통계 페이지**를 모두 포함하고 있으며, 공통된 Prisma 클라이언트를 사용하여 데이터 모델을 공유합니다. 공통 Prisma 스키마는 `data-model/prisma/schema.prisma` 파일에 정의되어 있습니다.

# 프로젝트 환경

- OS는 Ubuntu 24.04
- PostgreSQL 16
- NodeJS 18.x

## Prisma 명령어

Prisma 관련 명령어는 `client/package.json`에 `prisma:{명령어}` 형태로 정의되어 있으며, `client` 디렉토리에서 아래 명령어를 실행하여 사용할 수 있습니다.

```json
// client/package.json
"prisma:generate": "PRISMA_CLIENT_OUTPUT=../../client/node_modules/.prisma/client npx prisma generate --schema=../data-model/prisma/schema.prisma",
"prisma:migrate": "PRISMA_CLIENT_OUTPUT=../../client/node_modules/.prisma/client npx prisma migrate dev --schema=../data-model/prisma/schema.prisma",
"prisma:studio": "PRISMA_CLIENT_OUTPUT=../../client/node_modules/.prisma/client npx prisma studio --schema=../data-model/prisma/schema.prisma",
"prisma:seed": "PRISMA_CLIENT_OUTPUT=../../client/node_modules/.prisma/client ts-node ./seed.ts --schema=../data-model/prisma/schema.prisma",
"prisma:dbreset": "PRISMA_CLIENT_OUTPUT=../../client/node_modules/.prisma/client npx prisma db push --force-reset --schema=../data-model/prisma/schema.prisma"
```

### 명령어 설명

- **`prisma:generate`**: 공통 스키마로 Prisma 클라이언트를 생성합니다.
- **`prisma:migrate`**: 데이터베이스 마이그레이션을 실행하여 최신 스키마로 업데이트합니다.
- **`prisma:studio`**: Prisma Studio를 실행하여 데이터베이스를 GUI로 관리합니다.
- **`prisma:seed`**: 시드 데이터를 추가합니다.
- **`prisma:dbreset`**: 데이터베이스를 강제로 리셋하고 스키마를 푸시합니다.

각 명령어는 `client` 디렉토리에서 아래와 같이 실행할 수 있습니다:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:dbreset
```

### TEST

```
$ npm run prisma:seed
```

activity test id: 'test_activity_id'
localhost 접속 시, 아래처럼 접속
http://localhost:3000/?activityId=test_activity_id&job=ff

### QuizSet 정보에 대한 redirect 처리

- Middleware:

* URL에서 quiz_id를 확인.
* 필요한 경우 API를 호출해 만료 상태를 확인.
  만료된 경우 /error/expired로 리다이렉트.

- QuizLoader:

* API를 통해 퀴즈 데이터를 로드.
* 만료된 경우 redirect('/error/expired') 호출.

- ExpiredPage:

* 만료된 퀴즈 요청을 처리하여 사용자에게 알림.
