# Domain, Regeion, Subsidiary 데이타 만들기

1. domain/input_data.json을 수기로 마련 (certificaiton_acitivity code.xlsx 파일 참조)
2. 아래의 명령어를 터미널에서 실행

```
$ python create.py
```

3. seeds 폴더 안에 생성된 domains.json, regions.json subsidiaries.json 확인

# Channels 데이타 만들기 (삼플 미사용 유저의 Channel 선택 시 사용하는 데이타)

1. channel/input_data를 수기로 마련
2. seeds/grouped_domains.json 을 기반으로 input_data를 id 기빈으로 transformed_data.json의 형태로 변환

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
