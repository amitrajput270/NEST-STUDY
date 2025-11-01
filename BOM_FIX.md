# BOM (Byte Order Mark) Issue - FIXED

## Problem

When uploading CSV files, all data was being inserted as NULL in the database.

## Root Cause

The CSV file contained a **UTF-8 BOM (Byte Order Mark)** character (`\ufeff`) at the beginning of the file. This caused the first column name to be read as `"\ufeffsr"` instead of `"sr"`, which meant the column mapping failed and all values were treated as undefined/NULL.

### What is BOM?

- BOM is a special Unicode character (U+FEFF)
- Often added by Windows applications (Excel, Notepad) when saving CSV files
- It's invisible in most text editors but breaks column name matching

## Solution Applied

Added `bom: true` option to all CSV parsers and specified UTF-8 encoding:

```typescript
const parser = parse({
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true, // ✅ Handle UTF-8 BOM
  // ... other options
});

const stream = createReadStream(filePath, { encoding: 'utf8' });
```

This tells the CSV parser to automatically strip the BOM character before processing headers.

## Files Updated

- `src/file-upload/file-upload.service.ts` - All CSV parsing functions

## Testing

After restarting your server, the CSV upload should now work correctly:

```bash
# Restart server
npm run start:dev

# Test with your file
curl -X POST \
  "http://localhost:3000/api/v1/file-upload/csv?batchSize=500" \
  -F "file=@~/Downloads/assigment/Bulk_Ledger.csv"
```

## How to Check for BOM

```bash
# Check if file has BOM
hexdump -C your-file.csv | head -n 1
# If you see "ef bb bf" at the start, the file has UTF-8 BOM

# Or use file command
file your-file.csv
# Output: "UTF-8 Unicode (with BOM) text"
```

## Prevention

If you're creating CSV files programmatically, avoid adding BOM:

- Use `utf-8` encoding without BOM
- In Excel: Save As → CSV UTF-8 (without BOM) if available
- In code: Don't write the BOM character when creating files

## Status

✅ **FIXED** - BOM handling is now automatic for all CSV uploads
