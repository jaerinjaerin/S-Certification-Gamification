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

## quizset_path 규칙

https://docs.bien.ltd/workspace/b03d84d0-8deb-435f-8ab5-947410d96204/-gmbwVIItKO2j9Qa7esrt
