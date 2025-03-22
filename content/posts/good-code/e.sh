#!/bin/bash

# Script to replace lines starting with -- and ending with --<br> with ### headings
# Will process all files in the current directory

# Check if there are any files
if [ -z "$(ls -A)" ]; then
    echo "No files found in the current directory"
    exit 1
fi

echo "Converting -- headings to ### format in all files..."

# Process each file in the current directory
for file in *.md; do
    # Skip if not a regular file or if no markdown files exist
    if [ ! -f "$file" ]; then
        continue
    fi
    
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Use sed to replace lines starting with -- and ending with --<br>
    # The pattern matches:
    # ^-- at the beginning of line
    # (.*) captures the content between the dashes
    # --<br>$ at the end of line
    # And replaces with ### followed by the captured content
    sed -E 's/^-- (.*) --<br>$/### \1/g' "$file" > "$temp_file"
    
    # Replace the original file with the modified content
    mv "$temp_file" "$file"
done

echo "All files processed successfully"
