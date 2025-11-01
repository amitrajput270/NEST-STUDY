#!/bin/bash

# Script to generate large fees data CSV files for testing

echo "=== Large Fees Data CSV Generator ==="
echo ""

# Get parameters
read -p "How many records do you want to generate? (default: 100000): " num_records
num_records=${num_records:-100000}

read -p "Output filename? (default: large-fees-data.csv): " filename
filename=${filename:-large-fees-data.csv}

echo ""
echo "Generating $num_records records to $filename..."
echo "This may take a few minutes for large files..."
echo ""

# Generate the CSV file using Node.js
node -e "
const fs = require('fs');
const stream = fs.createWriteStream('$filename');

// Progress indicator
let progress = 0;
const total = $num_records;

// Write header
stream.write('sr,date,academic_year,session,alloted_category,voucher_type,voucher_no,roll_no,admno_uniqueid,status,fee_category,faculty,program,department,batch,receipt_no,fee_head,due_amount,paid_amount,concession_amount,scholarship_amount,reverse_concession_amount,write_off_amount,adjusted_amount,refund_amount,fund_trancfer_amount,remarks\n');

// Sample data arrays
const categories = ['General', 'SC', 'ST', 'OBC', 'EWS'];
const sessions = ['ODD', 'EVEN'];
const statuses = ['Active', 'Inactive', 'Graduated', 'Withdrawn'];
const feeCategories = ['Regular', 'Hostel', 'Transport', 'Library'];
const faculties = ['Engineering', 'Arts', 'Science', 'Commerce', 'Medical'];
const programs = ['B.Tech', 'BA', 'BSc', 'BCom', 'MBBS', 'M.Tech', 'MA', 'MSc'];
const departments = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'English', 'History', 'Physics', 'Chemistry', 'Mathematics',
  'Accounting', 'Business Administration', 'Medicine', 'Surgery'
];
const feeHeads = [
  'Tuition Fee', 'Examination Fee', 'Library Fee', 'Lab Fee',
  'Sports Fee', 'Development Fee', 'Hostel Fee', 'Caution Deposit'
];

// Generate rows
for (let i = 1; i <= total; i++) {
  // Show progress every 10%
  if (i % Math.floor(total / 10) === 0) {
    progress += 10;
    console.log(\`Progress: \${progress}%\`);
  }

  // Generate date (spread across a year)
  const dayOffset = Math.floor((i / total) * 365);
  const date = new Date(2025, 0, 1 + dayOffset).toISOString().split('T')[0];

  // Random selections
  const category = categories[Math.floor(Math.random() * categories.length)];
  const session = sessions[Math.floor(Math.random() * sessions.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const feeCategory = feeCategories[Math.floor(Math.random() * feeCategories.length)];
  const faculty = faculties[Math.floor(Math.random() * faculties.length)];
  const program = programs[Math.floor(Math.random() * programs.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const feeHead = feeHeads[Math.floor(Math.random() * feeHeads.length)];

  // Generate amounts
  const dueAmount = Math.floor(Math.random() * 50000) + 10000;
  const paidPercentage = 0.7 + Math.random() * 0.3; // 70-100%
  const paidAmount = Math.floor(dueAmount * paidPercentage);
  const concessionAmount = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
  const scholarshipAmount = Math.random() > 0.8 ? Math.floor(Math.random() * 10000) : 0;
  const reverseAmount = 0;
  const writeOffAmount = 0;
  const adjustedAmount = 0;
  const refundAmount = 0;
  const fundTransferAmount = 0;

  // Generate IDs
  const sr = i;
  const academicYear = '2024-25';
  const voucherNo = 'V' + String(i).padStart(8, '0');
  const rollNo = 'ROLL' + String(i).padStart(7, '0');
  const admnoUniqueId = 'ADM' + String(i).padStart(10, '0');
  const batch = String(2020 + Math.floor(Math.random() * 5));
  const receiptNo = 'RCP' + String(i).padStart(10, '0');
  const remarks = Math.random() > 0.5 ? 'Payment record ' + i : '';

  // Write row
  stream.write(\`\${sr},\${date},\${academicYear},\${session},\${category},Fee,\${voucherNo},\${rollNo},\${admnoUniqueId},\${status},\${feeCategory},\${faculty},\${program},\${department},\${batch},\${receiptNo},\${feeHead},\${dueAmount.toFixed(2)},\${paidAmount.toFixed(2)},\${concessionAmount.toFixed(2)},\${scholarshipAmount.toFixed(2)},\${reverseAmount.toFixed(2)},\${writeOffAmount.toFixed(2)},\${adjustedAmount.toFixed(2)},\${refundAmount.toFixed(2)},\${fundTransferAmount.toFixed(2)},\${remarks}\n\`);
}

stream.end();
console.log('100%');
console.log('');
console.log('File generation complete!');
"

# Get file size
if [ -f "$filename" ]; then
    filesize=$(du -h "$filename" | cut -f1)
    linecount=$(wc -l < "$filename")

    echo ""
    echo "✓ File created successfully!"
    echo ""
    echo "Details:"
    echo "  Filename: $filename"
    echo "  Size: $filesize"
    echo "  Lines: $linecount (including header)"
    echo "  Records: $num_records"
    echo ""
    echo "Next steps:"
    echo "  1. Review the file: head -n 5 $filename"
    echo "  2. Upload it: curl -X POST 'http://localhost:3000/api/v1/file-upload/csv?batchSize=500' -F 'file=@$filename'"
    echo "  3. Or use the test script: ./test-fees-upload.sh"
else
    echo ""
    echo "✗ Error: File generation failed"
fi
