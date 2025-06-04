from locust import HttpUser, task, between
import pandas as pd
import random

# 엑셀 로딩
try:
    df = pd.read_excel("input.xlsx")
    sampled_data = df.sample(n=2000).to_dict(orient="records")
except Exception as e:
    print("엑셀 로딩 실패:", e)
    sampled_data = []

class QuizUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def get_quiz_question_log(self):
        if not sampled_data:
            return  # 데이터 없으면 요청 안 보냄

        data = random.choice(sampled_data)
        user_id = data.get("userId")
        quizset_id = data.get("quizSetId")
        stage_index = data.get("quizStageIndex")
        print(f"Requesting: {user_id}, {quizset_id}, {stage_index}")

        if not (user_id and quizset_id):
            return  # 필수 파라미터가 없으면 스킵

        url = f"/api/logs/quizzes/questions?user_id={user_id}&quizset_id={quizset_id}&stage_index={int(stage_index)}"

        with self.client.get(url, name="/api/logs/quizzes/questions", catch_response=True) as response:
            if response.status_code == 200:
                print(f"Success: {response.status_code}")
                response.success()
            else:
                print(f"Failed: {response.status_code}")
                response.failure(f"Failed: {response.status_code}")
