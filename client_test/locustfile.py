from locust import HttpUser, TaskSet, task, between

class UserBehavior(TaskSet):
    @task(1)
    def index_page(self):
        self.client.get("/s24")  # Next.js 홈페이지

    @task(2)
    def api_call(self):
        self.client.get("https://stg-quiz.samsungplus.net/api/campaigns/quizsets/NAT_2764_th?user_id=33b5deb9-8549-4762-8b46-23ff56a71ec7")  # 특정 API 호출

    @task(3)
    def submit_form(self):
        # POST 요청: 데이터 전송
        payload = {
            "id": "question_stage_user_250_1_0",
            "userId": "user_250",
            "authType": "GUEST",
            "campaignId": "s24",
            "quizSetId": "quiz_set_48",
            "quizStageId": "stage_1",
            "quizStageIndex": 1,
            "questionId": "question_1_0",
            "isCorrect": True,
            "selectedOptionIds": [
                "option_4",
                "option_3",
                "option_1"
            ],
            "correctOptionIds": [
                "option_4",
                "option_3",
                "option_1"
            ],
            "questionType": "SINGLE_CHOICE",
            "category": "category_7",
            "specificFeature": "feature_1",
            "product": "product_5",
            "elapsedSeconds": 21,
            "domainId": 349965,
            "languageId": "ar-AE",
            "jobId": "2",
            "regionId": 508372,
            "subsidaryId": 548582,
            "storeId": "2",
            "storeSegmentText": "segment_text_2",
            "channelId": "1",
            "channelSegmentId": "1",
            "createdAt": "2025-04-21T06:11:03+00:00",
            "updatedAt": "2025-05-16T12:42:10+00:00"
        }
        headers = {
            "Content-Type": "application/json"
        }
        # POST 요청: "/api/submit" 엔드포인트로 데이터 전송
        self.client.post("/api/logs/quizzes/questions", json=payload, headers=headers)

    @task(4)
    def submit_form(self):
        # POST 요청: 데이터 전송
        payload = {
            "id": "stage_user_30000_2",
            "userId": "user_30000",
            "authType": "SUMTOTAL",
            "campaignId": "s24",
            "quizSetId": "quiz_set_32",
            "quizStageIndex": 3,
            "quizStageId": "stage_2",
            "isBadgeStage": True,
            "isBadgeAcquired": True,
            "elapsedSeconds": 28,
            "score": 47,
            "remainingHearts": 3,
            "domainId": 333974,
            "languageId": "da",
            "jobId": "10",
            "regionId": 508373,
            "subsidaryId": 49,
            "storeId": "5",
            "storeSegmentText": "segment_text_2",
            "channelId": "3",
            "channelSegmentId": "1",
            "createdAt": "2025-05-30T06:33:08+00:00",
            "updatedAt": "2025-02-23T00:09:30+00:00"
        }
        headers = {
            "Content-Type": "application/json"
        }
        # POST 요청: "/api/submit" 엔드포인트로 데이터 전송
        self.client.post("/api/logs/quizzes/stages", json=payload, headers=headers)


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)  # 1초 ~ 5초 대기