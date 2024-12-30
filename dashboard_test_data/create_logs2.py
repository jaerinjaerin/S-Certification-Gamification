import os
import json
import random
import uuid
from datetime import datetime, timedelta, timezone

# Load reference data
with open('../upload_seed_data/data/seeds/grouped_domains.json', 'r') as f:
    grouped_domains = json.load(f)
with open('../upload_seed_data/data/seeds/languages.json', 'r') as f:
    languages = json.load(f)
with open('../upload_seed_data/data/seeds/jobs.json', 'r') as f:
    jobs = json.load(f)
with open('../upload_seed_data/data/seeds/stores.json', 'r') as f:
    stores = json.load(f)
with open('../upload_seed_data/data/seeds/channels.json', 'r') as f:
    channels = json.load(f)
with open('../upload_seed_data/data/seeds/channel_segments.json', 'r') as f:
    channel_segments = json.load(f)

# Constants
BASE_S3_PATH = "./results/"
START_DATE = datetime(2025, 1, 20)
END_DATE = datetime(2025, 6, 30)
NUM_USERS = 260_000
QUESTIONS_PER_STAGE = 10
STAGES_PER_USER = 4
BADGE_STAGES = [2, 3]
AUTH_TYPES = ["SUMTOTAL", "GUEST"]
OPTION_IDS = ["option_1", "option_2", "option_3", "option_4"]

# Separate domains, regions, and subsidiaries
DOMAINS = grouped_domains.get('domains', [])
REGIONS = grouped_domains.get('regions', [])
SUBSIDIARIES = grouped_domains.get('subsidaries', [])

LANGUAGES = [lang['code'] for lang in languages]
JOBS = [job['id'] for job in jobs]
STORES = [store['id'] for store in stores]
CHANNELS = [channel['id'] for channel in channels]
SEGMENTS = [segment['id'] for segment in channel_segments]

# Ensure base directory exists
os.makedirs(BASE_S3_PATH, exist_ok=True)

def random_date(start, end):
    """Generate a random ISO-8601 formatted datetime string between start and end, with UTC timezone"""
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    random_time = start + timedelta(seconds=random_seconds)
    return random_time.replace(tzinfo=timezone.utc).isoformat()  # UTC 시간대 추가

def adjust_date(base_date, max_delta_seconds):
    """Adjust a date by a random number of seconds within the given delta, with UTC timezone"""
    delta_seconds = random.randint(0, max_delta_seconds)
    adjusted_time = base_date + timedelta(seconds=delta_seconds)
    return adjusted_time.replace(tzinfo=timezone.utc).isoformat()  # UTC 시간대 추가

def save_to_s3(schema_name, date, data, max_records=10000):
    """Save data to S3-like structure, split into smaller files if too large"""
    path = os.path.join(BASE_S3_PATH, schema_name, date)
    os.makedirs(path, exist_ok=True)
    
    for i in range(0, len(data), max_records):
        unique_id = uuid.uuid4().hex  # Unique identifier for each file
        file_path = os.path.join(path, f"{schema_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{unique_id}.json")
        with open(file_path, "w") as f:
            json.dump(data[i:i+max_records], f, indent=2)
        print(f"Saved {schema_name} data to {file_path}")

# Generate user quiz logs
user_ids = [f"user_{i}" for i in range(NUM_USERS)]
user_quiz_logs = [
    {
        'id': f"log_{i}",
        'userId': user_id,
        'authType': random.choice(AUTH_TYPES),
        'campaignId': "s24",
        'quizSetId': f"quiz_set_{random.randint(1, 50)}",
        'isCompleted': random.choice([True, False]),
        'isBadgeAcquired': random.choice([True, False]),
        'lastCompletedStage': random.randint(0, 4),
        'elapsedSeconds': random.randint(0, 3600),
        'score': random.randint(0, 100),
        'quizSetPath': f"path/to/quiz_set_{random.randint(1, 50)}",
        'domainId': random.choice([d['domainId'] for d in DOMAINS if 'domainId' in d]) if DOMAINS else None,
        'languageId': random.choice(LANGUAGES),
        'jobId': random.choice(JOBS),
        'regionId': random.choice([r['domainId'] for r in REGIONS if 'domainId' in r]) if REGIONS else None,
        'subsidaryId': random.choice([s['domainId'] for s in SUBSIDIARIES if 'domainId' in s]) if SUBSIDIARIES else None,
        'storeId': random.choice(STORES),
        'storeSegmentText': f"segment_text_{random.randint(1, 5)}",
        'channelId': random.choice(CHANNELS),
        'channelSegmentId': random.choice(SEGMENTS),
        'createdAt': random_date(START_DATE, END_DATE),
        'updatedAt': random_date(START_DATE, END_DATE),
    }
    for i, user_id in enumerate(user_ids)
]
save_to_s3("user_quiz_logs", "2025", user_quiz_logs)

# Generate stage logs based on UserQuizLog
stage_logs = []
for log in user_quiz_logs:
    base_created_at = datetime.fromisoformat(log['createdAt'])
    base_updated_at = datetime.fromisoformat(log['updatedAt'])

    for stage_index in range(1, STAGES_PER_USER + 1):
        stage_logs.append({
            'id': f"stage_{log['userId']}_{stage_index}",
            'userId': log['userId'],
            'authType': log['authType'],
            'campaignId': log['campaignId'],
            'quizSetId': log['quizSetId'],
            'quizStageIndex': stage_index,
            'quizStageId': f"stage_{stage_index}",
            'isBadgeStage': stage_index in BADGE_STAGES,
            'isBadgeAcquired': stage_index in BADGE_STAGES and random.choice([True, False]),
            'elapsedSeconds': random.randint(0, 900),
            'score': random.randint(0, 100),
            'remainingHearts': random.randint(3, 5),
            'domainId': log['domainId'],
            'languageId': log['languageId'],
            'jobId': log['jobId'],
            'regionId': log['regionId'],
            'subsidaryId': log['subsidaryId'],
            'storeId': log['storeId'],
            'storeSegmentText': log['storeSegmentText'],
            'channelId': log['channelId'],
            'channelSegmentId': log['channelSegmentId'],
            'createdAt': adjust_date(base_created_at, 3600),  # 최대 1시간 이내 변동
            'updatedAt': adjust_date(base_updated_at, 7200),  # 최대 2시간 이내 변동
        })
save_to_s3("user_quiz_stage_logs", "2025", stage_logs)

# Generate question logs based on StageLogs
question_logs = []
for stage in stage_logs:
    base_created_at = datetime.fromisoformat(stage['createdAt'])
    base_updated_at = datetime.fromisoformat(stage['updatedAt'])

    for q_index in range(QUESTIONS_PER_STAGE):
        selected_options = random.sample(OPTION_IDS, k=random.randint(1, len(OPTION_IDS)))
        correct_options = random.sample(OPTION_IDS, k=random.randint(1, len(OPTION_IDS)))
        
        # Set isCorrect to be True 90% of the time
        is_correct = random.random() < 0.9

        if is_correct:
            selected_options = correct_options  # Ensure selected options match correct options

        question_logs.append({
            'id': f"question_{stage['id']}_{q_index}",
            'userId': stage['userId'],
            'authType': stage['authType'],
            'campaignId': stage['campaignId'],
            'quizSetId': stage['quizSetId'],
            'quizStageId': stage['quizStageId'],
            'quizStageIndex': stage['quizStageIndex'],
            'questionId': f"question_{stage['quizStageIndex']}_{q_index}",
            'isCorrect': is_correct,
            'selectedOptionIds': selected_options,
            'correctOptionIds': correct_options,
            "questionType": "SINGLE_CHOICE",
            'category': f"category_{random.randint(1, 10)}",
            'specificFeature': f"feature_{random.randint(1, 5)}",
            'product': f"product_{random.randint(1, 5)}",
            'elapsedSeconds': random.randint(5, 30),
            'domainId': stage['domainId'],
            'languageId': stage['languageId'],
            'jobId': stage['jobId'],
            'regionId': stage['regionId'],
            'subsidaryId': stage['subsidaryId'],
            'storeId': stage['storeId'],
            'storeSegmentText': stage['storeSegmentText'],
            'channelId': stage['channelId'],
            'channelSegmentId': stage['channelSegmentId'],
            'createdAt': adjust_date(base_created_at, 1800),  # 최대 30분 이내 변동
            'updatedAt': adjust_date(base_updated_at, 3600),  # 최대 1시간 이내 변동
        })

        # Save and clear when 10,000 records are reached
        if len(question_logs) >= 10000:
            save_to_s3("user_quiz_question_logs", "2025", question_logs)
            question_logs = []

# Save remaining question logs
if question_logs:
    save_to_s3("user_quiz_question_logs", "2025", question_logs)

# Generate badge stage logs based on StageLogs
badge_stage_logs = [
    {
        'id': f"badge_{stage['id']}",
        'userId': stage['userId'],
        'authType': stage['authType'],
        'campaignId': stage['campaignId'],
        'quizSetId': stage['quizSetId'],
        'quizStageId': stage['quizStageId'],
        'quizStageIndex': stage['quizStageIndex'],
        'isBadgeAcquired': stage['isBadgeAcquired'],
        'elapsedSeconds': stage['elapsedSeconds'],
        'score': stage['score'],
        'domainId': stage['domainId'],
        'languageId': stage['languageId'],
        'jobId': stage['jobId'],
        'regionId': stage['regionId'],
        'subsidaryId': stage['subsidaryId'],
        'storeId': stage['storeId'],
        'storeSegmentText': stage['storeSegmentText'],
        'channelId': stage['channelId'],
        'channelSegmentId': stage['channelSegmentId'],
        'createdAt': stage['createdAt'],
        'updatedAt': stage['updatedAt'],
    }
    for stage in stage_logs if stage['isBadgeStage']
]
save_to_s3("user_quiz_badge_stage_logs", "2025", badge_stage_logs)

print("Data generation completed.")
