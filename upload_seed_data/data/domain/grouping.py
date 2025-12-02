import json
from collections import defaultdict

# Load the JSON data
with open("domain_from_sumtotalapi.json", "r") as file:
    data = json.load(file)

# Create a set to track already grouped items
grouped_items = set()

# Group HQ
hq = [
    item for item in data 
    if not item["parentDomainName"] or item["parentDomainName"] in [None, ""]
]
grouped_items.update(item["domainCode"] for item in hq)

# Group Regions
regions = [
    item for item in data 
    # if (item["parentDomainName"] == "Samsung Global" or item["domainCode"].startswith("ORG_"))
    if (item["parentDomainName"] == "Samsung Global")
    and item["domainCode"] not in grouped_items
]
grouped_items.update(item["domainCode"] for item in regions)

# Group subsidiaries
subsidiaries = []
subsidiary_map = defaultdict(list)

for item in data:
    if (
        item["parentDomainName"] in {region["domainName"] for region in regions} 
        and item["domainCode"] not in grouped_items
    ):
        subsidiaries.append(item)
        subsidiary_map[item["parentDomainName"]].append(item)
        grouped_items.add(item["domainCode"])

# Group Countries
domains = [
    item for item in data if item["domainCode"] not in grouped_items
]
grouped_items.update(item["domainCode"] for item in domains)

# Combine all groups into a dictionary
output = {
    "hq": hq,
    "regions": regions,
    "subsidiaries": subsidiaries,
    "domains": domains,
}

# Save the grouped data to a JSON file
with open("../seeds/grouped_domains.json", "w") as outfile:
    json.dump(output, outfile, indent=4)

print("Grouped data saved to 'grouped_domains.json'")
