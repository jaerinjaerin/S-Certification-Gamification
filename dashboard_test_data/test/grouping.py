import json
from collections import defaultdict

# Load the JSON data
with open("domain_from_sumtotalapi.json", "r") as file:
    data = json.load(file)

# Create the groups
hq = [item for item in data if not item["parentDomainName"] or item["parentDomainName"] in [None, ""]]
regions = [item for item in data if item["parentDomainName"] == "Samsung Global"]
subsidiaries = []
domains = []

# Identify region names for grouping
region_names = {region["domainName"] for region in regions}

# Group subsidiaries and countries
subsidiary_map = defaultdict(list)

for item in data:
    if item in hq or item in regions:
        continue
    if item["parentDomainName"] in region_names:
        subsidiaries.append(item)
        subsidiary_map[item["parentDomainName"]].append(item)
    else:
        domains.append(item)

# Combine all groups into a dictionary
output = {
    "hq": hq,
    "regions": regions,
    "subsidiaries": subsidiaries,
    "domains": domains,
}

# Save the grouped data to a JSON file
with open("grouped_domains.json", "w") as outfile:
    json.dump(output, outfile, indent=4)

print("Grouped data saved to 'grouped_domains.json'")
