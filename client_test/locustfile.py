from bs4 import BeautifulSoup

import time
from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    @task(1)
    def index_page(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"/s25/{timestamp}")  # Next.js 홈페이지

    @task(2)
    def index_page2(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"/s25/NAT_2862_ko/quiz")  # Next.js 홈페이지

    @task(3)
    def index_page3(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"/s25/NAT_2862_ko/map")  # Next.js 홈페이지

    @task(4)
    def index_page4(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"/s25/NAT_2862_ko/complete")  # Next.js 홈페이지

    @task(5)
    def api_call1(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"https://stg-quiz.samsungplus.net/api/campaigns/quizsets/NAT_2360_id?user_id=a0c29c07-5eed-49b8-8f8d-39639e3e882a&nocache={timestamp}")  # 특정 API 호출

    @task(6)
    def api_call2(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"https://stg-quiz.samsungplus.net/api/logs/quizzes/sets?user_id=9032d015-86ae-4056-9fef-36adca43d897&campaign_name=s25&nocache={timestamp}")  # 특정 API 호출

    @task(7)
    def api_call3(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"https://stg-quiz.samsungplus.net/api/campaigns?campaign_name=s25")  # 특정 API 호출

    @task(8)
    def api_call4(self):
        timestamp = int(time.time() * 1000)
        self.client.get(f"https://stg-quiz.samsungplus.net/api/languages")  # 특정 API 호출

    @task(9)
    def load_homepage(self):
        """메인 페이지 로드 + 관련 리소스 자동 요청"""
        response = self.client.get("/s25")
        
        if response.status_code == 200:
            self.fetch_assets(response.text)  # HTML 파싱 후 리소스 요청

    def fetch_assets(self, html):
        """HTML 내부에서 CSS, JS, 이미지 링크를 찾아 요청"""
        soup = BeautifulSoup(html, "html.parser")

        static_assets = []

        # CSS 파일 찾기
        for link in soup.find_all("link", {"rel": "stylesheet"}):
            static_assets.append(link["href"])

        # JS 파일 찾기
        for script in soup.find_all("script", {"src": True}):
            static_assets.append(script["src"])

        # 이미지 파일 찾기
        for img in soup.find_all("img", {"src": True}):
            static_assets.append(img["src"])

        # 병렬로 리소스 가져오기
        for asset in static_assets:
            if not asset.startswith("http"):  # 상대경로이면 절대경로로 변경
                asset = self.client.base_url + asset
            self.client.get(asset, name="Static Asset")

    # @task(3)
    # def submit_form(self):
    #     # POST 요청: 데이터 전송
    #     payload = {
    #         "id": "question_stage_user_250_1_0",
    #         "userId": "user_250",
    #         "authType": "GUEST",
    #         "campaignId": "s24",
    #         "quizSetId": "quiz_set_48",
    #         "quizStageId": "stage_1",
    #         "quizStageIndex": 1,
    #         "questionId": "question_1_0",
    #         "isCorrect": True,
    #         "selectedOptionIds": [
    #             "option_4",
    #             "option_3",
    #             "option_1"
    #         ],
    #         "correctOptionIds": [
    #             "option_4",
    #             "option_3",
    #             "option_1"
    #         ],
    #         "questionType": "SINGLE_CHOICE",
    #         "category": "category_7",
    #         "specificFeature": "feature_1",
    #         "product": "product_5",
    #         "elapsedSeconds": 21,
    #         "domainId": 349965,
    #         "languageId": "ar-AE",
    #         "jobId": "2",
    #         "regionId": 508372,
    #         "subsidiaryId": 548582,
    #         "storeId": "2",
    #         "storeSegmentText": "segment_text_2",
    #         "channelId": "1",
    #         "channelSegmentId": "1",
    #         "createdAt": "2025-04-21T06:11:03+00:00",
    #         "updatedAt": "2025-05-16T12:42:10+00:00"
    #     }
    #     headers = {
    #         "Content-Type": "application/json"
    #     }
    #     # POST 요청: "/api/submit" 엔드포인트로 데이터 전송
    #     self.client.post("/api/logs/quizzes/questions", json=payload, headers=headers)

    # @task(4)
    # def submit_form(self):
    #     # POST 요청: 데이터 전송
    #     payload = {
    #         "id": "stage_user_30000_2",
    #         "userId": "user_30000",
    #         "authType": "SUMTOTAL",
    #         "campaignId": "s24",
    #         "quizSetId": "quiz_set_32",
    #         "quizStageIndex": 3,
    #         "quizStageId": "stage_2",
    #         "isBadgeStage": True,
    #         "isBadgeAcquired": True,
    #         "elapsedSeconds": 28,
    #         "score": 47,
    #         "remainingHearts": 3,
    #         "domainId": 333974,
    #         "languageId": "da",
    #         "jobId": "10",
    #         "regionId": 508373,
    #         "subsidiaryId": 49,
    #         "storeId": "5",
    #         "storeSegmentText": "segment_text_2",
    #         "channelId": "3",
    #         "channelSegmentId": "1",
    #         "createdAt": "2025-05-30T06:33:08+00:00",
    #         "updatedAt": "2025-02-23T00:09:30+00:00"
    #     }
    #     headers = {
    #         "Content-Type": "application/json"
    #     }
    #     # POST 요청: "/api/submit" 엔드포인트로 데이터 전송
    #     self.client.post("/api/logs/quizzes/stages", json=payload, headers=headers)


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)  # 1초 ~ 5초 대기