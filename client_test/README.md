locust -f locustfile.py --headless -u 50 -r 5 --host https://stg-quiz.samsungplus.net -t 1m

### 옵션

- -u 100: 100명의 가상 사용자.
- -r 10: 초당 10명의 사용자 증가.
- -t 5m: 테스트 실행 시간 5분.

```
스테이징 서버
locust -f locustfile.py --host https://stg-quiz.samsungplus.net --headless -u 100 -r 10 -t 2m --csv=locust_report --html=locust_report.html

운영 서버
locust -f locustfile.py --host https://quiz.samsungplus.net --headless -u 500 -r 20 -t 5m --csv=locust_report --html=locust_report.html
```

locust -f locustfile.py --host https://stg-quiz.samsungplus.net

https://stg-quiz.samsungplus.net:8089
