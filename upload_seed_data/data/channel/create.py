import json

# Load data from input files
with open("channels.json", "r") as f:
    channels_data = json.load(f)

with open("channel_segments.json", "r") as f:
    channel_segments = json.load(f)

with open("regions.json", "r") as f:
    regions = json.load(f)

with open("subsidaries.json", "r") as f:
    subsidaries = json.load(f)

with open("domains.json", "r") as f:
    domains = json.load(f)

# Create dictionaries for quick lookup
channel_segments_dict = {item["name"]: item["id"] for item in channel_segments}
regions_dict = {item["name"]: item["id"] for item in regions}
subsidaries_dict = {item["name"]: item["id"] for item in subsidaries}
domain_lookup = {domain["code"]: domain["id"] for domain in domains}

# Adjusted transformation
final_channels_with_domain = []

for country in channels_data:
    domain_id = domain_lookup.get(country["code"])  # Map code to domainId
    region_id = regions_dict.get(country["region"])
    subsidary_id = subsidaries_dict.get(country["subsidary"])

    transformed_country = {
        "name": country["name"],
        "domainId": domain_id,  # Replace "code" with "domainId"
        "regionId": region_id,
        "subsidaryId": subsidary_id,
        "channels": []
    }

    for channel in country["channels"]:
        transformed_country["channels"].append({
            "name": channel["name"],
            "jobId": channel["job"]["id"],  # Directly using the job's id from channels.json
            "channelSegmentId": channel_segments_dict.get(channel["channelSegment"]["name"])
        })

    final_channels_with_domain.append(transformed_country)

# Save the final transformed data with domainId
with open("final_channels_with_domain.json", "w") as f:
    json.dump(final_channels_with_domain, f, indent=2)

print("Transformed data has been saved to 'final_channels_with_domain.json'.")
