import os
import json
import re
from markitdown import MarkItDown

def convert_bullets_to_html(cell_content):
    """
    Converts inline Markdown-style bullets in a table cell to HTML list items.
    """
    # Match inline bullet points (e.g., "* item1 * item2")
    bullet_pattern = r'(\*|-)\s([^*|-]+)'  # Matches "* item" or "- item"

    # Find all bullet points and wrap them in <li> tags
    matches = re.findall(bullet_pattern, cell_content)
    if matches:
        html_list = "".join([f"<li>{match[1].strip()}</li>" for match in matches])
        return f"<ul>{html_list}</ul>"
    return cell_content  # Return unchanged if no bullets found

def convert_markdown_table(markdown_content):
    """
    Processes a Markdown table and converts bullets in cells to HTML.
    """
    lines = markdown_content.split("\n")
    processed_lines = []
    for line in lines:
        if "|" in line:  # Table row
            cells = line.split("|")
            processed_cells = [convert_bullets_to_html(cell.strip()) for cell in cells]
            processed_lines.append(" | ".join(processed_cells))
        else:
            processed_lines.append(line)
    return "\n".join(processed_lines)

def convert_doc_to_md_and_json(doc_filepath, markdown_dir, json_dir):
    """
    Converts a .doc or .docx file to Markdown and JSON formats with custom table processing.
    """
    # Create converter instance
    md = MarkItDown()

    # Convert file to Markdown
    result = md.convert(doc_filepath)

    # Get Markdown content as plain text
    markdown_content = result.text_content

    # Process table formatting
    markdown_content = convert_markdown_table(markdown_content)

    # Save Markdown content
    markdown_filename = os.path.splitext(os.path.basename(doc_filepath))[0] + ".md"
    markdown_filepath = os.path.join(markdown_dir, markdown_filename)
    with open(markdown_filepath, "w", encoding="utf8") as md_file:
        md_file.write(markdown_content)

    # Convert to JSON
    json_content = {"contents": markdown_content}

    # Custom JSON filename logic
    original_name = os.path.basename(doc_filepath)
    match = re.match(r"\{([^}]+)\}\.\{([^}]+)\}\.\{([^}]+)\}\.(.+)$", original_name)
    if match:
        nat_code = match.group(2).strip("{}")  # Extract the second group (NAT code)
        json_filename = f"{nat_code}.json"
    else:
        json_filename = os.path.splitext(original_name)[0] + ".json"

    # Save JSON content
    json_filepath = os.path.join(json_dir, json_filename)
    if os.path.exists(json_filepath):
        # If file exists, append new content to existing JSON with separator
        with open(json_filepath, "r", encoding="utf8") as json_file:
            existing_content = json.load(json_file)
        existing_content["contents"] += "\n\n\n---\n\n" + json_content["contents"]
        json_content = existing_content

    with open(json_filepath, "w", encoding="utf8") as json_file:
        json.dump(json_content, json_file, indent=4)

# Input directory
input_dir = "origins"

# Output directories
markdown_dir = "markdowns"
json_dir = "jsons"
os.makedirs(markdown_dir, exist_ok=True)
os.makedirs(json_dir, exist_ok=True)

for filename in os.listdir(input_dir):
    if filename.endswith(".doc") or filename.endswith(".docx"):
        input_filepath = os.path.join(input_dir, filename)
        print(f"Start converting {filename}")
        convert_doc_to_md_and_json(input_filepath, markdown_dir, json_dir)
        print(f"End converting {filename}")
