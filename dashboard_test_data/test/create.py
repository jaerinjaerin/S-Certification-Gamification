
import json

# Load data from JSON file
with open("grouped_domains.json", "r") as f:
    data = json.load(f)

print("Star.")

# Initialize groups
hq = []
regions = []
subsidiaries = []
countries = []

# Process the data
for item in data:
    parent_name = item.get("parentDomainName", "").strip()

    # Group by conditions
    if parent_name == "" or parent_name is None:
        hq.append(item)
    elif any(region["domainName"] == parent_name for region in regions):
        subsidiaries.append(item)
    elif parent_name == "Samsung Global":
        regions.append(item)
    else:
        countries.append(item)

# Save results to separate JSON files
with open("hq.json", "w") as f:
    json.dump(hq, f, indent=2)

with open("regions.json", "w") as f:
    json.dump(regions, f, indent=2)

with open("subsidiaries.json", "w") as f:
    json.dump(subsidiaries, f, indent=2)

with open("domains.json", "w") as f:
    json.dump(countries, f, indent=2)

print("Data has been grouped and saved into 'hq.json', 'regions.json', 'subsidiaries.json', and 'countries.json'.")
