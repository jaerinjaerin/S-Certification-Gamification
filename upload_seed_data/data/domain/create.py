import json

# Load data from JSON file
with open("input_data.json", "r") as f:
    data = json.load(f)

# Initialize dictionaries to hold unique regions and subsidaries
regions = {}
subsidaries = {}

domains = []

region_id_counter = 1
subsidary_id_counter = 1
domain_id_counter = 1

def get_region_id(region_name):
    if region_name not in regions:
        global region_id_counter
        regions[region_name] = {
            "id": str(region_id_counter),
            "name": region_name
        }
        region_id_counter += 1
    return regions[region_name]["id"]

def get_subsidary_id(subsidary_name):
    if subsidary_name not in subsidaries:
        global subsidary_id_counter
        subsidaries[subsidary_name] = {
            "id": str(subsidary_id_counter),
            "name": subsidary_name
        }
        subsidary_id_counter += 1
    return subsidaries[subsidary_name]["id"]

# Process the data
for item in data:
    region_id = get_region_id(item["region"])
    subsidary_id = get_subsidary_id(item["subsidary"])

    # Add domain
    domains.append({
        "id": str(domain_id_counter),
        "regionId": region_id,
        "subsidaryId": subsidary_id,
        "name": item["name"],
        "code": item["code"]
    })
    domain_id_counter += 1

# Convert dictionaries to lists
regions_list = list(regions.values())
subsidaries_list = list(subsidaries.values())

# Save results to separate JSON files
with open("../seeds/regions.json", "w") as f:
    json.dump(regions_list, f, indent=2)

with open("../seeds/subsidaries.json", "w") as f:
    json.dump(subsidaries_list, f, indent=2)

with open("../seeds/domains.json", "w") as f:
    json.dump(domains, f, indent=2)

print("Regions, subsidaries, and domains have been extracted and saved to '../seeds/'.")
