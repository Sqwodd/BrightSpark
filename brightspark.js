import fs from "fs";

// Custom Parse function
function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map((h) => h.trim());

  // Process each line into an object
  return lines.map((line) => {
    const parts = [];
    let current = "";
    let in_quotes = false;

    // Handle quotes and commas inside quoted fields
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        in_quotes = !in_quotes;
      } else if (char === "," && !in_quotes) {
        parts.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    parts.push(current);

    // Map the cell values to header names
    const record = {};
    headers.forEach((h, i) => {
      record[h] = parts[i]?.trim() ?? "";
    });

    return record;
  });
}

// Main 
function main() {
  // Exit if argument is missing
  if (process.argv.length !== 3) {
    console.error("Usage: node brightspark.js <input_file.csv>");
    process.exit(1);
  }

  // Input file
  const filePath = process.argv[2];

  // Try reading the file
  let data;
  try {
    data = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`Error: Cannot read file '${filePath}'.`);
    process.exit(1);
  }

  // Parse CSV
  const records = parseCSV(data);

  // If CSV file is empty
  if (records.length === 0) {
    console.log("No records found in file.");
    process.exit(0);
  }

  // Convert numeric fields
  for (const r of records) {
    r.division = parseInt(r.division);
    r.points = parseInt(r.points);

    if (isNaN(r.division)) {
      console.error("Error: divisions must be integers.");
      process.exit(1);
    }
    else if (isNaN(r.points)) {
      console.error("Error: points must be integers.");
      process.exit(1);
    }
  }

  // Sort records by ascending division, descending points
  const sorted = records.sort((a, b) => {
    if (a.division !== b.division) return a.division - b.division;
    return b.points - a.points;
  });

  // Top 3 records
  const topThree = sorted.slice(0, 3);

  // YAML Output
  console.log("records:");
  for (const r of topThree) {
    const name = `${r.firstname} ${r.lastname}`;
    const details = `In division ${r.division} from ${r.date} performing ${r.summary}`;
    console.log(`- name: ${name}`);
    console.log(`  details: ${details}`);
  }
}

// Driver
main();
