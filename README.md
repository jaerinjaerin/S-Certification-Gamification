# 프로젝트 설정

이 저장소는 **퀴즈 서비스(client)**, **CMS**, **통계 페이지**를 모두 포함하고 있으며, 공통된 Prisma 클라이언트를 사용하여 데이터 모델을 공유합니다. 공통 Prisma 스키마는 `data-model/prisma/schema.prisma` 파일에 정의되어 있습니다.

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
npm run prisma:seed
npm run prisma:dbreset
```
