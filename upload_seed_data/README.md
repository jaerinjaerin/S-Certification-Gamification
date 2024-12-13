# 번역본 엑셀 파일을 Json 형태로 변환하기

1. 번역본 파일을 data/origins에 위치
2. 번역본 파일 이름 확인 -> {any}|{domain_code}|{language_code}.xlsx 형태여야 함
3. 아래의 명령어 터미널에서 실행

```
$ python convert.py
```

4. data/questions 안에 변환된 json 파일 확인

# 변환된 Json 파일을 DB에 밀어넣기

```
# 1. prisma client 생성
$ npm run prisma:generate

# 2. prisma를 이용해 seed 데이타 생성
$ npm run prisma:seed
```

- 이 때, seeds안에 있는 json을 참조로 domain, job, language, channel_segment, store정보도 같이 db에 밀어넣음.
