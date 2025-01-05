import random
import uuid
import pandas as pd
from datetime import datetime, timedelta
import os

# Define datasets
domains = [
    {"region": "HQ", "subsidary": "SEHQ", "name": "HQ Retail Team", "code": "HQ_NAT_0001"},
    {"region": "North America", "subsidary": "SECA", "name": "Canada", "code": "NAT_7000"}
]

stores = [
    {"id": "1", "name": "offline-store"},
    {"id": "2", "name": "online-store"}
]

jobs = [
    {"id": "1", "code": "fsm", "group": "fsm", "name": "FSM(FSC) Store Sales", "description": "FSM(FSC)"},
    {"id": "2", "code": "fsm", "group": "fsm", "name": "FSM(FSC) e-promoter", "description": "FSM(FSC)"}
]

languages = [
    {"code": "en-US", "name": "Language for EN US"},
    {"code": "fr-FR", "name": "Language for FR FR"}
]

# Define date range for the past month
end_date = datetime.now()
start_date = end_date - timedelta(days=30)

# Helper functions
def random_item(data):
    return random.choice(data)

def random_date(start, end):
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

# Generate logs
def generate_large_user_quiz_logs_with_dates(user_ids):
    logs = []
    for user_id in user_ids:
        logs.append({
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "quizSetId": str(uuid.uuid4()),
            "isCompleted": random.choice([True, False]),
            "isBadgeAcquired": random.choice([True, False]),
            "lastCompletedStage": random.randint(1, 5),
            "timeSpent": random.randint(100, 500),
            "score": random.randint(50, 100),
            "domainId": random_item(domains)["code"],
            "regionId": random_item(domains)["region"],
            "storeId": random_item(stores)["id"],
            "createdAt": random_date(start_date, end_date),
            "updatedAt": random_date(start_date, end_date)
        })
    return logs

def generate_large_user_quiz_stage_logs_with_dates(user_ids):
    logs = []
    for user_id in user_ids:
        logs.append({
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "quizStageId": str(uuid.uuid4()),
            "isCompleted": random.choice([True, False]),
            "elapsedSeconds": random.randint(50, 200),
            "score": random.randint(10, 20),
            "quizStageIndex": random.randint(1, 5),
            "domainId": random_item(domains)["code"],
            "regionId": random_item(domains)["region"],
            "jobId": random_item(jobs)["id"],
            "createdAt": random_date(start_date, end_date),
            "updatedAt": random_date(start_date, end_date)
        })
    return logs

def generate_large_user_quiz_question_logs_with_dates(user_ids):
    logs = []
    for user_id in user_ids:
        logs.append({
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "questionId": str(uuid.uuid4()),
            "quizSetId": str(uuid.uuid4()),
            "isCorrect": random.choice([True, False]),
            "selectedOptionIds": [str(uuid.uuid4()) for _ in range(random.randint(1, 3))],
            "correctOptionIds": [str(uuid.uuid4()) for _ in range(random.randint(1, 3))],
            "elapsedSeconds": random.randint(10, 50),
            "questionType": random.choice(["MULTI_CHOICE", "TRUE_FALSE"]),
            "domainId": random_item(domains)["code"],
            "regionId": random_item(domains)["region"],
            "languageId": random_item(languages)["code"],
            "createdAt": random_date(start_date, end_date),
            "updatedAt": random_date(start_date, end_date)
        })
    return logs

# Generate user IDs
num_users = 200000  # Adjust as needed
user_ids = [str(uuid.uuid4()) for _ in range(num_users)]

# Chunk size
chunk_size = 10000

# Define the output folder
output_folder = "output"

# Create the folder if it does not exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Generate and save data in chunks
def save_data_in_chunks(data, file_prefix, sheet_name):
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        df = pd.DataFrame(chunk)
        file_path = os.path.join(output_folder, f"{file_prefix}_part_{i // chunk_size + 1}.xlsx")
        with pd.ExcelWriter(file_path) as writer:
            df.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f"Saved {file_path}")

# Generate data
user_quiz_logs = generate_large_user_quiz_logs_with_dates(user_ids)
user_quiz_stage_logs = generate_large_user_quiz_stage_logs_with_dates(user_ids)
user_quiz_question_logs = generate_large_user_quiz_question_logs_with_dates(user_ids)

# Save data to Excel in chunks
save_data_in_chunks(user_quiz_logs, "user_quiz_logs", "UserQuizLogs")
save_data_in_chunks(user_quiz_stage_logs, "user_quiz_stage_logs", "UserQuizStageLogs")
save_data_in_chunks(user_quiz_question_logs, "user_quiz_question_logs", "UserQuizQuestionLogs")

print("Data saved in chunks.")
