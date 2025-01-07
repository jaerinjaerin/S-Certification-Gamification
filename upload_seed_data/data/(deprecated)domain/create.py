import json

# Load data from JSON file
with open("input_data.json", "r") as f:
    data = json.load(f)

# Initialize dictionaries to hold unique regions and subsidiaries
regions = {}
subsidiaries = {}

domains = []

region_id_counter = 1
subsidiary_id_counter = 1
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

def get_subsidiary_id(subsidiary_name):
    if subsidiary_name not in subsidiaries:
        global subsidiary_id_counter
        subsidiaries[subsidiary_name] = {
            "id": str(subsidiary_id_counter),
            "name": subsidiary_name
        }
        subsidiary_id_counter += 1
    return subsidiaries[subsidiary_name]["id"]

# Process the data
for item in data:
    region_id = get_region_id(item["region"])
    subsidiary_id = get_subsidiary_id(item["subsidiary"])

    # Add domain
    domains.append({
        "id": str(domain_id_counter),
        "regionId": region_id,
        "subsidiaryId": subsidiary_id,
        "name": item["name"],
        "code": item["code"]
    })
    domain_id_counter += 1

# Convert dictionaries to lists
regions_list = list(regions.values())
subsidiaries_list = list(subsidiaries.values())

# Save results to separate JSON files
with open("../seeds/regions.json", "w") as f:
    json.dump(regions_list, f, indent=2)

with open("../seeds/subsidiaries.json", "w") as f:
    json.dump(subsidiaries_list, f, indent=2)

with open("../seeds/domains.json", "w") as f:
    json.dump(domains, f, indent=2)

print("Regions, subsidiaries, and domains have been extracted and saved to '../seeds/'.")
