import json

# File paths
input_data_path = './input_data.json'
channel_segments_path = '../seeds/channel_segments.json'
grouped_domains_path = '../seeds/grouped_domains.json'

# Load data from files
with open(input_data_path, 'r') as f:
    input_data = json.load(f)

with open(channel_segments_path, 'r') as f:
    channel_segments = {segment["name"].strip(): segment["id"] for segment in json.load(f)}

with open(grouped_domains_path, 'r') as f:
    grouped_domains = json.load(f)

# Helper function to find regionId and subsidiaryId
def find_domain_ids(domain_name):
    if not domain_name:  # domain_name이 없을 경우 None 반환
        return None, None

    domain_name = domain_name.strip().upper()  # 대소문자와 공백 처리
    region_id = None
    subsidiary_id = None

    for region in grouped_domains["regions"]:
        if region["domainName"].strip().upper() == domain_name:
            region_id = region["domainId"]
            break

    for subsidiary in grouped_domains["subsidiaries"]:
        if subsidiary["domainName"].strip().upper() == domain_name:
            subsidiary_id = subsidiary["domainId"]
            break

    return region_id, subsidiary_id

# Track missing data
missing_data = {
    "regionId": [],
    "subsidiaryId": [],
    "channelSegmentId": []
}

# Transform data
transformed_data = []

for entry in input_data:
    region_name = entry.get("region")
    subsidiary_name = entry.get("subsidiary")

    region_id = find_domain_ids(region_name)[0]  # regionId만 추출
    subsidiary_id = find_domain_ids(subsidiary_name)[1]  # subsidiaryId만 추출

    if region_id is None:
        missing_data["regionId"].append(region_name)
    if subsidiary_id is None:
        missing_data["subsidiaryId"].append(subsidiary_name)

    transformed_entry = {
        "name": entry.get("name"),
        "code": entry.get("code"),
        "regionId": str(region_id) if region_id else "",
        "subsidiaryId": str(subsidiary_id) if subsidiary_id else "",
        "channels": []
    }

    for channel in entry.get("channels", []):
        channel_segment_id = channel_segments.get(channel["channelSegment"]["name"].strip(), None)
        if channel_segment_id is None:
            missing_data["channelSegmentId"].append(channel["channelSegment"]["name"])
        transformed_entry["channels"].append({
            "name": channel["name"],
            "jobId": channel["job"]["id"],
            "channelSegmentId": str(channel_segment_id) if channel_segment_id else ""
        })

    transformed_data.append(transformed_entry)

# Save transformed data
output_path = './transformed_data.json'
with open(output_path, 'w') as f:
    json.dump(transformed_data, f, indent=4)

print(f"Transformed data saved to {output_path}")

# Print missing data
print("Missing Data:")
for key, values in missing_data.items():
    if values:
        print(f"{key}: {values}")
