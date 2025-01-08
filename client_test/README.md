locust -f locustfile.py --headless -u 100 -r 10 --host https://stg-quiz.samsungplus.net -t 5m

### 옵션

- -u 100: 100명의 가상 사용자.
- -r 10: 초당 10명의 사용자 증가.
- -t 5m: 테스트 실행 시간 5분.

```
locust -f locustfile.py --host https://stg-quiz.samsungplus.net --headless -u 1000 -r 100 -t 5m --csv=locust_report --html=locust_report.html
```

locust -f locustfile.py --host https://stg-quiz.samsungplus.net

https://stg-quiz.samsungplus.net:8089
