#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  echo "Loading environment variables from .env file"
  export $(cat .env | grep -v '#' | awk '/^[A-Z]/ {print $1}')
else
  echo "Warning: .env file not found"
fi

# Run the script
echo "Running generate-missing-slugs script..."
npm run generate-missing-slugs

echo "Done!" 