# File Upload Module - Large CSV Files (up to 300 MB)

This module handles uploading and processing large CSV files up to 300 MB using streaming for efficient memory usage. It's specifically configured to import fees data into the `fees_data` MySQL table.

## Database Schema

The module works with the `fees_data` table which stores student fee information:

```sql
CREATE TABLE `fees_data` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sr` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `academic_year` varchar(50) DEFAULT NULL,
  `session` varchar(50) DEFAULT NULL,
  `alloted_category` varchar(100) DEFAULT NULL,
  `voucher_type` varchar(50) DEFAULT NULL,
  `voucher_no` varchar(50) DEFAULT NULL,
  `roll_no` varchar(50) DEFAULT NULL,
  `admno_uniqueid` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `fee_category` varchar(100) DEFAULT NULL,
  `faculty` varchar(100) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `batch` varchar(100) DEFAULT NULL,
  `receipt_no` varchar(100) DEFAULT NULL,
  `fee_head` varchar(100) DEFAULT NULL,
  `due_amount` decimal(12,2) DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT NULL,
  `concession_amount` decimal(12,2) DEFAULT NULL,
  `scholarship_amount` decimal(12,2) DEFAULT NULL,
  `reverse_concession_amount` decimal(12,2) DEFAULT NULL,
  `write_off_amount` decimal(12,2) DEFAULT NULL,
  `adjusted_amount` decimal(12,2) DEFAULT NULL,
  `refund_amount` decimal(12,2) DEFAULT NULL,
  `fund_trancfer_amount` decimal(12,2) DEFAULT NULL,
  `remarks` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## CSV File Format

Your CSV file should have the following columns (header row required):

```
sr,date,academic_year,session,alloted_category,voucher_type,voucher_no,roll_no,admno_uniqueid,status,fee_category,faculty,program,department,batch,receipt_no,fee_head,due_amount,paid_amount,concession_amount,scholarship_amount,reverse_concession_amount,write_off_amount,adjusted_amount,refund_amount,fund_trancfer_amount,remarks
```

**Sample CSV row:**

```
1,2025-01-15,2024-25,ODD,General,Fee,V000001,ROLL00001,ADM00000001,Active,Regular,Engineering,B.Tech,Computer Science,2024,RCP00000001,Tuition Fee,50000.00,45000.00,2500.00,5000.00,0.00,0.00,0.00,0.00,0.00,First installment paid
```

See `fees-data-template.csv` in the root directory for a complete example.

## Features

- ✅ Upload CSV files up to 300 MB
- ✅ Streaming file processing (memory efficient)
- ✅ Batch processing with configurable batch size
- ✅ CSV validation
- ✅ File structure validation
- ✅ Automatic file cleanup
- ✅ Progress tracking and error reporting

## API Endpoints

### 1. Upload and Process CSV

**Endpoint:** `POST /api/v1/file-upload/csv`

**Description:** Upload and process a large CSV file with streaming.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: CSV file (required)
- Query Parameters:
  - `batchSize`: Number of rows to process in each batch (optional, default: 1000, max: 10000)

**Example using cURL:**

```bash
curl -X POST \
  http://localhost:3000/api/v1/file-upload/csv?batchSize=1000 \
  -F "file=@/path/to/your/large-file.csv"
```

**Example using Postman:**

1. Select `POST` method
2. Enter URL: `http://localhost:3000/api/v1/file-upload/csv?batchSize=1000`
3. Go to Body tab
4. Select `form-data`
5. Add key `file` with type `File`
6. Choose your CSV file
7. Click Send

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "filename": "file-1730419200000-123456789.csv",
    "originalName": "large-data.csv",
    "size": 314572800,
    "mimeType": "text/csv",
    "uploadedAt": "2025-10-31T10:00:00.000Z",
    "rowsProcessed": 1500000,
    "status": "success",
    "message": "Successfully processed 1500000 rows"
  },
  "errors": null,
  "trace": null
}
```

### 2. Validate CSV Structure

**Endpoint:** `POST /api/v1/file-upload/csv/validate`

**Description:** Validate CSV file structure and check for required columns.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: CSV file (required)
- Query Parameters:
  - `requiredColumns`: Comma-separated list of required column names (optional)

**Example:**

```bash
curl -X POST \
  "http://localhost:3000/api/v1/file-upload/csv/validate?requiredColumns=id,name,email,phone" \
  -F "file=@/path/to/your/file.csv"
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "valid": true,
    "missingColumns": [],
    "fileInfo": {
      "filename": "file-1730419200000-123456789.csv",
      "size": 314572800,
      "headers": ["id", "name", "email", "phone", "address"],
      "estimatedRows": 1500000
    }
  },
  "errors": null,
  "trace": null
}
```

### 3. Get CSV File Information

**Endpoint:** `POST /api/v1/file-upload/csv/info`

**Description:** Get information about a CSV file without processing it.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: CSV file (required)

**Example:**

```bash
curl -X POST \
  http://localhost:3000/api/v1/file-upload/csv/info \
  -F "file=@/path/to/your/file.csv"
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "filename": "file-1730419200000-123456789.csv",
    "originalName": "data.csv",
    "size": 314572800,
    "headers": ["id", "name", "email", "phone"],
    "estimatedRows": 1500000
  },
  "errors": null,
  "trace": null
}
```

## Configuration

### Multer Configuration (`src/file-upload/config/multer.config.ts`)

```typescript
export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
  limits: {
    fileSize: 300 * 1024 * 1024, // 300 MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Only allow CSV files
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      extname(file.originalname).toLowerCase() === '.csv'
    ) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only CSV files are allowed'), false);
    }
  },
};
```

## Customization

### Data Processing

The `FileUploadService` automatically processes CSV data and inserts it into the `fees_data` table using bulk insert operations for optimal performance.

**Key Features:**

- **Automatic type conversion**: Strings, numbers, decimals, and dates are automatically converted
- **Null handling**: Empty values are handled as NULL in the database
- **Bulk insert**: Uses TypeORM's query builder for efficient batch inserts
- **Error handling**: Failed batches are logged with details

**How it works:**

1. CSV rows are read in batches (default: 1000 rows per batch)
2. Each row is transformed to match the `fees_data` entity structure
3. Data types are converted (strings, numbers, decimals, dates)
4. Batch is inserted into the database using bulk insert
5. Progress is logged and tracked

**Data Transformation:**

```typescript
// CSV row example
{
  sr: "1",
  date: "2025-01-15",
  academic_year: "2024-25",
  due_amount: "50000.00",
  paid_amount: "45000.00"
  // ... other fields
}

// Transformed to FeesData entity
{
  sr: 1,                          // Converted to number
  date: Date('2025-01-15'),      // Converted to Date object
  academic_year: "2024-25",      // String
  due_amount: 50000.00,          // Converted to decimal
  paid_amount: 45000.00          // Converted to decimal
  // ... other fields
}
```

## Performance Tips

1. **Batch Size**: Adjust batch size based on your data complexity

   - Simple data: Use larger batches (5000-10000)
   - Complex data with validation: Use smaller batches (500-2000)
   - Default: 1000 rows per batch

2. **Memory Usage**: The streaming approach keeps memory usage low regardless of file size

3. **Database**: Use bulk insert operations for better performance

4. **File Cleanup**: Files are automatically cleaned up after processing or on error

## Error Handling

The module includes comprehensive error handling:

- **Invalid file type**: Returns 400 Bad Request
- **File too large**: Returns 413 Payload Too Large
- **CSV parsing errors**: Returns detailed error information
- **Processing errors**: Tracks failed rows and provides error details

## Testing

### Quick Test with Provided Script

Use the automated test script for fees data:

```bash
./test-fees-upload.sh
```

This script will:

1. Generate a test CSV file with realistic fees data
2. Validate the CSV structure
3. Upload and process the file
4. Insert data into the `fees_data` table

### Manual Testing

#### 1. Test with the template file:

```bash
curl -X POST \
  http://localhost:3000/api/v1/file-upload/csv?batchSize=500 \
  -F "file=@fees-data-template.csv"
```

#### 2. Generate a large test file:

```bash
# Generate 100,000 fee records
node -e "
const fs = require('fs');
const stream = fs.createWriteStream('large-fees-data.csv');

// Write header
stream.write('sr,date,academic_year,session,alloted_category,voucher_type,voucher_no,roll_no,admno_uniqueid,status,fee_category,faculty,program,department,batch,receipt_no,fee_head,due_amount,paid_amount,concession_amount,scholarship_amount,reverse_concession_amount,write_off_amount,adjusted_amount,refund_amount,fund_trancfer_amount,remarks\\n');

// Generate rows
for (let i = 1; i <= 100000; i++) {
  const date = new Date(2025, 0, 1 + (i % 365)).toISOString().split('T')[0];
  const dueAmount = Math.floor(Math.random() * 50000) + 10000;
  const paidAmount = Math.floor(dueAmount * 0.8);
  const scholarship = Math.floor(Math.random() * 5000);

  stream.write(\`\${i},\${date},2024-25,ODD,General,Fee,V\${String(i).padStart(6,'0')},ROLL\${String(i).padStart(5,'0')},ADM\${String(i).padStart(8,'0')},Active,Regular,Engineering,B.Tech,Computer Science,2024,RCP\${String(i).padStart(8,'0')},Tuition Fee,\${dueAmount},\${paidAmount},0,\${scholarship},0,0,0,0,0,Test record \${i}\\n\`);
}
stream.end();
console.log('Large test file created: large-fees-data.csv');
"
```

#### 3. Upload the large file:

```bash
curl -X POST \
  "http://localhost:3000/api/v1/file-upload/csv?batchSize=500" \
  -F "file=@large-fees-data.csv"
```

#### 4. Verify in database:

```sql
-- Check total records
SELECT COUNT(*) as total_records FROM fees_data;

-- View latest records
SELECT * FROM fees_data ORDER BY id DESC LIMIT 10;

-- Check by academic year
SELECT academic_year, COUNT(*) as count
FROM fees_data
GROUP BY academic_year;

-- Calculate total amounts
SELECT
  SUM(due_amount) as total_due,
  SUM(paid_amount) as total_paid,
  SUM(scholarship_amount) as total_scholarship
FROM fees_data;
```

## File Structure

```
src/file-upload/
├── config/
│   └── multer.config.ts       # Multer configuration for file uploads
├── dto/
│   ├── index.ts               # DTO exports
│   └── upload-response.dto.ts # Response DTO
├── interfaces/
│   └── csv-row.interface.ts   # CSV row interfaces
├── file-upload.controller.ts  # Controller with endpoints
├── file-upload.service.ts     # Service with processing logic
└── file-upload.module.ts      # Module definition
```

## Environment Considerations

### Production Settings

1. **File Storage**: Consider using cloud storage (S3, Google Cloud Storage) for production
2. **Processing**: Consider using a queue system (Bull, RabbitMQ) for background processing
3. **Limits**: Adjust file size limits based on your server capacity
4. **Cleanup**: Implement scheduled cleanup of old uploaded files

### Server Configuration

Make sure your server can handle large file uploads:

**Nginx:**

```nginx
client_max_body_size 350M;
client_body_timeout 300s;
```

**Apache:**

```apache
LimitRequestBody 367001600
Timeout 300
```

## Dependencies

- `@nestjs/platform-express`: File upload support
- `csv-parse`: Efficient CSV parsing with streaming
- `multer`: Middleware for handling multipart/form-data
- `@types/multer`: TypeScript types for Multer

## Support

For issues or questions, please check:

- NestJS documentation: https://docs.nestjs.com/
- csv-parse documentation: https://csv.js.org/parse/
