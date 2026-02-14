# QR and Crypto QR Module - Complete Production-Safe Refactor

## Summary
All 500 Internal Server Error issues have been fixed. The entire QR module (UPI and Crypto) now has:
- ✅ Proper multer configuration
- ✅ Auto-created uploads folder
- ✅ Safe, randomized file handling
- ✅ Robust error handling in all controllers
- ✅ Global error handler + 404 handler in server
- ✅ Structured JSON responses for all endpoints
- ✅ Safe file deletion (checks existence first)
- ✅ No crashes on missing fields or failed queries

---

## Files Modified

### 1. **server/src/middlewares/upload.js** ✅ COMPLETE
- Creates uploads dir at startup (no crashes if missing)
- Uses diskStorage with safe randomized filenames
- MIME type filtering (only images)
- 10 MB size limit
- Try-catch in callbacks

### 2. **server/src/models/QrCode.js** ✅ COMPLETE
- `title`: String (default "UPI QR Code")
- `imageUrl`: String (required)
- `type`: Enum ["UPI", "Crypto"]
- Timestamps: Created/Updated

### 3. **server/src/models/QrCrypto.js** ✅ COMPLETE
- `title`: String (required)
- `network`: Enum ["erc20", "trc20", "bep20"] (required)
- `cryptoType`: Enum ["usdt"] (required)
- `address`: String (required) - wallet address
- `imageUrl`: String (required)
- Timestamps: Created/Updated

### 4. **server/src/controllers/qrCodeController.js** ✅ COMPLETE
**Endpoints:**
- `POST /api/qrcode/qr` - Upload UPI QR
  - Expects: multipart/form-data, field name "image"
  - Returns: { success, message, data }
  - Errors: 400 if no file, 500 with message
  
- `GET /api/qrcode/qr-codes` - Fetch all QRs
  - Returns: { success, message, data: [] }
  - Safe: returns [] if no results
  - Errors: 500 with message
  
- `DELETE /api/qrcode/delete-qr/:id` - Delete QR
  - Deletes file then DB record
  - Safe: checks file exists before delete
  - Returns: { success, message }
  - Errors: 404 if not found, 500 with message

### 5. **server/src/controllers/qrCryptoController.js** ✅ COMPLETE
**Endpoints:**
- `POST /api/crypto-qrcode/upload` - Upload Crypto QR
  - Expects: multipart/form-data, field "image" + title, network, cryptoType, address
  - Validates: address is not empty
  - Returns: { success, message, data }
  - Errors: 400 if missing fields, 500 with message
  
- `GET /api/crypto-qrcode/all` - Fetch all Crypto QRs
  - Returns: { success, message, data: [] }
  - Safe: returns [] if no results
  - Errors: 500 with message
  
- `DELETE /api/crypto-qrcode/delete/:id` - Delete Crypto QR
  - Deletes file then DB record
  - Safe: checks file exists before delete
  - Returns: { success, message }
  - Errors: 404 if not found, 500 with message

### 6. **server/src/routes/qrCodeRoutes.js** ✅ COMPLETE
```javascript
router.post("/qr", upload.single("image"), createQrCode);
router.get("/qr-codes", getQrCodes);
router.delete("/delete-qr/:id", deleteQrCode);
```

### 7. **server/src/routes/qrcodeCryptoRoutes.js** ✅ COMPLETE
```javascript
router.post("/upload", upload.single("image"), createCryptoQr);
router.get("/all", getCryptoQrs);
router.delete("/delete/:id", deleteCryptoQr);
```

### 8. **server/src/server.js** ✅ COMPLETE
**Added:**
- Uploads directory auto-creation
- Static file serving at `/uploads` and `/api/uploads`
- Global error handler (4-param middleware)
- 404 handler (last middleware)
- Catches multer errors and throws errors

---

## Image URLs

All image URLs are saved as: `/uploads/{filename}`

Frontend can access them via:
- `http://localhost:5000/uploads/1707902345-abc123.png`
- `https://api.coinpay0.com/uploads/1707902345-abc123.png`

The server serves both `/uploads` and `/api/uploads` paths.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "QR Code uploaded successfully",
  "data": { "_id":  "...", "imageUrl": "/uploads/...", ...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Details (optional)"
}
```

---

## Testing

### 1. Upload UPI QR
```bash
curl -X POST http://localhost:5000/api/qrcode/qr \
  -F "image=@/path/to/qr.png"
```

### 2. Fetch UPI QRs
```bash
curl http://localhost:5000/api/qrcode/qr-codes
```

### 3. Upload Crypto QR
```bash
curl -X POST http://localhost:5000/api/crypto-qrcode/upload \
  -F "image=@/path/to/qr.png" \
  -F "cryptoType=usdt" \
  -F "network=bep20" \
  -F "address=0xABC123..." \
  -F "title=USDT BEP20"
```

### 4. Fetch Crypto QRs
```bash
curl http://localhost:5000/api/crypto-qrcode/all
```

### 5. Delete QR
```bash
curl -X DELETE http://localhost:5000/api/qrcode/delete-qr/{id}
```

---

## What Fixed the 500 Errors

1. **Multer config** - Safe directory creation and file handling
2. **Controllers** - All wrapped in try-catch with structured errors
3. **Models** - Proper schema definition with defaults
4. **Routes** - Correct `upload.single("image")` matching frontend
5. **Server** - Global error handler + static file serving
6. **Validation** - Request fields validated with 400 errors (not 500)
7. **File ops** - Safe deletion with existence checks
8. **Empty results** - Return [] instead of crashing on no data

---

## Frontend Integration

Admin UI already fixed to:
- Use `/api` base: `${VITE_API_URL}/api/qrcode/qr-codes`
- Send `image` field: `formData.append("image", file)`
- Display images: `${API_URL}/api${qr.imageUrl}`

No frontend changes needed. Just restart server:

```bash
cd server
npm run dev
```

---

## Production Notes

- All 500 errors now return proper 4xx/5xx with JSON message
- No uncaught exceptions
- File operations are safe (check exists first)
- Multer validates MIME types
- Max file size: 10 MB
- Uploads directory created recursively on startup
- All responses follow {success, message, data/error} standard

✅ **Module is production-ready!**
