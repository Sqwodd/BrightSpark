import yaml
import csv
import sys

def main():
    # Exit if argument is missing
    if len(sys.argv) != 2:
        print("Usage: python3 brightspark.py <input_file.csv>")
        sys.exit(1)

    # Get input file from command line argument
    file = sys.argv[1]

    # Try to open and parse CSV file
    try:
        with open(file, newline = '') as csvfile:
            # Read first row as header. Use column names as dict keys for each row
            reader = csv.DictReader(csvfile)
            records = list(reader)
    except FileNotFoundError:
        print(f"Error: File '{file}' not found.")
        sys.exit(1)

    # If CSV file is empty
    if not records:
        print("No records in file.")
        sys.exit(0)

    # Convert numeric fields to integers for sorting
    for idx, r in enumerate(records):
        try:
            r["division"] = int(r["division"])
            r["points"] = int(r["points"])
        except KeyError as error:
            # Missing expected column in the CSV header
            print(f"Error: CSV is missing column: {error}")
            sys.exit(1)
        except ValueError as error:
            # Non-integer value in numeric column
            print(f"Error: Invalid numeric value in row {idx + 1}: {error}")
            sys.exit(1)

    # Sort records by ascending division, descending points
    sorted_records = sorted(records, key = lambda x: (x["division"], -x["points"]))

    # Top 3 records
    top_three = sorted_records[:3]

    # YAML Output
    yaml_records = []
    for record in top_three:
        yaml_records.append({
            "name": f"{record['firstname']} {record['lastname']}",
            "details": f"In division {record['division']} from {record['date']} performing {record['summary']}"
        })

    output = {"records": yaml_records}

    print(yaml.dump(output, sort_keys = False).strip())

# Driver
if __name__ == "__main__":
    main()
