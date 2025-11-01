# Fees Data CSV Upload - Quick Start Guide

## Overview

This module allows you to upload large CSV files (up to 300 MB) containing fees data directly into your MySQL `fees_data` table.

## Prerequisites

1. **Database Setup**: Make sure your `fees_data` table exists in MySQL
2. **Environment**: Set `DB_TYPE=mysql` in your `.env` file
3. **Server Running**: Start the NestJS application

```bash
npm run start:dev
```

## Quick Start

### Option 1: Use the Test Script (Recommended)

```bash
./test-fees-upload.sh
```

Follow the prompts to:

- Generate test data
- Validate CSV structure
- Upload and process the file

### Option 2: Upload Your Own CSV File

```bash
curl -X POST \
  "http://localhost:3000/api/v1/file-upload/csv?batchSize=500" \
  -F "file=@your-fees-data.csv"
```

## CSV Format

Your CSV file must include these columns in the header row:

```
sr,date,academic_year,session,alloted_category,voucher_type,voucher_no,roll_no,admno_uniqueid,status,fee_category,faculty,program,department,batch,receipt_no,fee_head,due_amount,paid_amount,concession_amount,scholarship_amount,reverse_concession_amount,write_off_amount,adjusted_amount,refund_amount,fund_trancfer_amount,remarks
```

**Example CSV:**
See `fees-data-template.csv` for a complete example with sample data.

## API Endpoints

### 1. Upload and Process CSV

```bash
POST /api/v1/file-upload/csv?batchSize=500
Content-Type: multipart/form-data
Body: file (CSV file)
```

### 2. Validate CSV Structure

```bash
POST /api/v1/file-upload/csv/validate?requiredColumns=sr,date,roll_no
Content-Type: multipart/form-data
Body: file (CSV file)
```

### 3. Get CSV Info (without processing)

```bash
POST /api/v1/file-upload/csv/info
Content-Type: multipart/form-data
Body: file (CSV file)
```

## Performance Tuning

### Batch Size Recommendations

| File Size  | Records   | Recommended Batch Size |
| ---------- | --------- | ---------------------- |
| < 10 MB    | < 50K     | 1000                   |
| 10-50 MB   | 50K-250K  | 500                    |
| 50-150 MB  | 250K-750K | 300                    |
| 150-300 MB | 750K-1.5M | 200                    |

**Example for large file:**

```bash
curl -X POST \
  "http://localhost:3000/api/v1/file-upload/csv?batchSize=200" \
  -F "file=@very-large-fees-data.csv"
```

### Processing Time Estimates

- **1,000 records**: ~2-5 seconds
- **10,000 records**: ~15-30 seconds
- **100,000 records**: ~2-4 minutes
- **1,000,000 records**: ~20-40 minutes

_Times vary based on server specs and batch size_

## Data Handling

### Type Conversions

| CSV Column    | Database Type | Conversion       |
| ------------- | ------------- | ---------------- |
| sr            | int           | String → Integer |
| date          | date          | String → Date    |
| academic_year | varchar       | String (trimmed) |
| due_amount    | decimal(12,2) | String → Decimal |
| paid_amount   | decimal(12,2) | String → Decimal |
| remarks       | text          | String (trimmed) |

### Null Handling

Empty values in CSV are automatically converted to NULL in the database:

- Empty strings → NULL
- Missing columns → NULL
- Invalid numbers → NULL
- Invalid dates → NULL

## Error Handling

### Common Errors

1. **File too large (413)**

   - Solution: Split your CSV into smaller files (< 300 MB each)

2. **Invalid CSV format (400)**

   - Solution: Ensure first row has column headers
   - Check for proper CSV formatting (commas, quotes)

3. **Database errors**
   - Check MySQL connection
   - Verify `fees_data` table exists
   - Check database user permissions

### Logs

Check application logs for detailed processing information:

```bash
tail -f logs/$(date +%Y/%m/%d)/general-*.log
tail -f logs/$(date +%Y/%m/%d)/error-*.log
```

## Verification

After upload, verify the data in MySQL:

```sql
-- Check total records inserted
SELECT COUNT(*) FROM fees_data;

-- View latest 10 records
SELECT * FROM fees_data ORDER BY id DESC LIMIT 10;

-- Check for specific admission number
SELECT * FROM fees_data WHERE admno_uniqueid = 'ADM00000001';

-- Calculate totals by academic year
SELECT
  academic_year,
  COUNT(*) as total_records,
  SUM(due_amount) as total_due,
  SUM(paid_amount) as total_paid,
  SUM(scholarship_amount) as total_scholarship
FROM fees_data
GROUP BY academic_year;
```

## Best Practices

1. **Validate First**: Always validate your CSV structure before uploading large files

   ```bash
   curl -X POST \
     "http://localhost:3000/api/v1/file-upload/csv/validate?requiredColumns=sr,roll_no,admno_uniqueid" \
     -F "file=@fees-data.csv"
   ```

2. **Test with Small Sample**: Test with first 100-1000 rows before uploading the entire file

   ```bash
   head -n 1001 large-fees-data.csv > sample-fees-data.csv
   ```

3. **Backup Database**: Backup your database before large imports

   ```bash
   mysqldump -u user -p database_name fees_data > fees_data_backup.sql
   ```

4. **Monitor Progress**: Check logs during processing for any errors

5. **Adjust Batch Size**: If you encounter memory issues, reduce batch size

## Troubleshooting

### File Upload Fails

Check server configuration:

- **Nginx**: `client_max_body_size 350M;`
- **Apache**: `LimitRequestBody 367001600`

### Slow Processing

- Reduce batch size (e.g., from 1000 to 500)
- Check database indexes
- Ensure sufficient server resources

### Memory Issues

- Reduce batch size to 100-200
- Process file in multiple smaller files
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run start:dev`

### Data Not Appearing

- Check for database errors in logs
- Verify database connection
- Check user permissions for INSERT operations

## Examples

### Upload with Postman

1. Create new request: `POST http://localhost:3000/api/v1/file-upload/csv?batchSize=500`
2. Go to **Body** tab
3. Select **form-data**
4. Add key: `file`, type: `File`
5. Choose your CSV file
6. Click **Send**

### Upload with Python

```python
import requests

url = "http://localhost:3000/api/v1/file-upload/csv"
params = {"batchSize": 500}
files = {"file": open("fees-data.csv", "rb")}

response = requests.post(url, params=params, files=files)
print(response.json())
```

### Upload with JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('fees-data.csv'));

axios
  .post('http://localhost:3000/api/v1/file-upload/csv?batchSize=500', form, {
    headers: form.getHeaders(),
  })
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error));
```

## Support

For detailed API documentation, see:

- `src/file-upload/README.md` - Complete module documentation
- `fees-data-template.csv` - CSV template with sample data
- `test-fees-upload.sh` - Automated testing script

## Next Steps

1. Review the template: `cat fees-data-template.csv`
2. Prepare your CSV file matching the template format
3. Test with a small sample first
4. Upload your complete file
5. Verify data in database
