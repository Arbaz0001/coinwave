# Complete QR + Deposit + Notification System Documentation

## System Overview

This is a complete, production-ready QR + Deposit + Notification system with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Axios
- **Real-time**: Socket.IO for notifications
- **File Storage**: Multer + Express.static

---

## Backend API Endpoints

### 1. DEPOSIT ROUTES (`/api/deposit`)

#### User Endpoints (require authentication)

**Submit UPI Deposit**
- **Method**: `POST /api/deposit/upi`
- **Auth**: Required (Bearer token)
- **Body**:
  ```json
  {
    "userId": "user_id",
    "amount": 500,
    "transactionId": "417U84EBVFD22F"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "UPI deposit request submitted successfully",
    "data": { "deposit_details" }
  }
  ```

**Submit Crypto Deposit**
- **Method**: `POST /api/deposit/crypto`
- **Auth**: Required
- **Body**:
  ```json
  {
    "userId": "user_id",
    "amount": 500,
    "cryptoType": "usdt",
    "network": "bep20",
    "transactionHash": "0xabc123..."
  }
  ```

**Get User's Deposits**
- **Method**: `GET /api/deposit/user/:userId`
- **Auth**: Required
- **Response**: Array of user's deposits

#### Admin Endpoints (requires admin/superadmin role)

**Get All Deposits**
- **Method**: `GET /api/admin/deposits`
- **Query**: `?status=pending` (optional: pending, approved, rejected)
- **Response**: All deposits with user details

**Approve Deposit**
- **Method**: `PUT /api/admin/deposits/:depositId/approve`
- **Body**:
  ```json
  {
    "remarks": "Amount verified"
  }
  ```
- **Action**: Updates wallet balance, creates notification

**Reject Deposit**
- **Method**: `PUT /api/admin/deposits/:depositId/reject`
- **Body**:
  ```json
  {
    "rejectionReason": "Transaction not found"
  }
  ```
- **Action**: Creates rejection notification

---

### 2. QR CODE ROUTES

#### Upload UPI QR
- **Method**: `POST /api/qrcode/qr`
- **Auth**: Required (admin)
- **Body**: FormData
  - `image`: File (image)
  - `title`: String (optional, default: "UPI QR Code")
- **Response**: Created QR document

#### Get All UPI QRs
- **Method**: `GET /api/qrcode/qr-codes`
- **Auth**: Not required
- **Response**: Array of UPI QRs

#### Delete UPI QR
- **Method**: `DELETE /api/admin/qr-codes/:qrId`
- **Auth**: Required (admin)

#### Upload Crypto QR
- **Method**: `POST /api/crypto-qrcode/upload`
- **Auth**: Required (admin)
- **Body**: FormData
  - `image`: File
  - `title`: String
  - `network`: Enum (trc20, erc20, bep20)
  - `cryptoType`: Enum (usdt)
  - `address`: String (wallet address)

#### Get All Crypto QRs
- **Method**: `GET /api/crypto-qrcode/all`
- **Auth**: Not required

#### Delete Crypto QR
- **Method**: `DELETE /api/admin/crypto-qr-codes/:qrId`
- **Auth**: Required (admin)

---

### 3. NOTIFICATION ROUTES (`/api/notification`)

#### Create Notification (Admin)
- **Method**: `POST /api/notification`
- **Auth**: Required
- **Body**:
  ```json
  {
    "title": "Deposit Approved",
    "message": "Your deposit has been approved",
    "userId": "user_id_or_null_for_broadcast",
    "isBroadcast": false
  }
  ```
- **Real-time**: Socket.IO emits to users

#### Get User Notifications
- **Method**: `GET /api/notification/user/:userId`
- **Auth**: Required
- **Response**: Notifications for user + broadcast notifications

#### Get All Notifications (Admin)
- **Method**: `GET /api/notification/all`
- **Auth**: Required

#### Mark as Read
- **Method**: `PUT /api/notification/:notificationId/read`
- **Auth**: Required

#### Delete Notification (Admin)
- **Method**: `DELETE /api/notification/:notificationId`
- **Auth**: Required

---

### 4. ADMIN MANAGEMENT ROUTES

#### Get Deposits
- **Method**: `GET /api/admin/deposits`
- **Query**: `?status=pending&method=UPI`

#### Approve/Reject Deposits
- **Methods**: `PUT /api/admin/deposits/:depositId/approve|reject`

#### Get QR Codes
- **Methods**: `GET /api/admin/qr-codes` & `GET /api/admin/crypto-qr-codes`

#### Delete QR Codes
- **Methods**: `DELETE /api/admin/qr-codes/:qrId` & `DELETE /api/admin/crypto-qr-codes/:qrId`

---

## Database Models

### Deposit Model
```javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  method: String (enum: UPI, Crypto),
  
  // For UPI
  upiDetails: {
    transactionId: String,
    timestamp: Date,
    upiId: String
  },
  
  // For Crypto
  cryptoDetails: {
    cryptoType: String,
    network: String,
    transactionHash: String,
    walletAddress: String,
    userWallet: String,
    timestamp: Date
  },
  
  status: String (enum: pending, approved, rejected),
  remarks: String,
  approvedBy: ObjectId,
  approvedAt: Date,
  rejectedBy: ObjectId,
  rejectedAt: Date,
  rejectionReason: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### QrCode Model
```javascript
{
  title: String (default: "UPI QR Code"),
  imageUrl: String (required),
  type: String (default: "UPI"),
  createdAt: Date,
  updatedAt: Date
}
```

### QrCrypto Model
```javascript
{
  title: String,
  network: String (enum: trc20, erc20, bep20),
  cryptoType: String (enum: usdt),
  address: String,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  title: String,
  message: String,
  userId: ObjectId (null for broadcast),
  readBy: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Components

### User Components

#### Deposit.jsx (Complete)
- Displays UPI and Crypto deposit options
- Shows QR codes fetched from backend
- Displays wallet addresses for crypto
- Form validation
- Submits to `/api/deposit/upi` or `/api/deposit/crypto`
- Success/error notifications via toast

**Features**:
- Method selection (UPI/Crypto)
- Network selection (TRC20, ERC20, BEP20)
- Auto-load QR codes on mount
- Address copy button
- Transaction ID/Hash input
- Amount validation (minimum ₹100)

### Admin Components

#### DepositRequests.jsx (Complete)
- Lists all deposit requests
- Filter by status (pending, approved, rejected)
- Modal for viewing full deposit details
- Approve/Reject actions with remarks
- Real-time wallet update on approval
- Auto-notification to users

**Features**:
- Table with sorting
- Status badges
- User information
- Amount display
- Date formatting
- Modal interactions

#### QRManagement.jsx (Complete)
- Upload UPI and Crypto QRs
- Tab-based interface
- Display uploaded QRs in grid
- Delete QRs with file cleanup
- Show wallet addresses for crypto QRs
- Image preview

**Features**:
- UPI upload form
- Crypto upload form (with network selection, wallet address)
- QR gallery
- Delete confirmation
- File upload validation

---

## Folder Structure

```
server/
├── src/
│   ├── models/
│   │   ├── Deposit.js ✅
│   │   ├── QrCode.js ✅
│   │   ├── QrCrypto.js ✅
│   │   ├── Notification.js ✅
│   │   └── User.js
│   │
│   ├── controllers/
│   │   ├── depositController.js ✅
│   │   ├── qrCodeController.js ✅
│   │   ├── qrCryptoController.js ✅
│   │   ├── notificationController.js ✅
│   │   ├── adminController.js ✅
│   │   └── user.controller.js
│   │
│   ├── routes/
│   │   ├── depositRoutes.js ✅
│   │   ├── qrCodeRoutes.js ✅
│   │   ├── qrcodeCryptoRoutes.js ✅
│   │   ├── notification.routes.js ✅
│   │   ├── adminRoutes.js ✅
│   │   └── ...
│   │
│   ├── middlewares/
│   │   ├── upload.js ✅
│   │   ├── authMiddleware.js ✅
│   │   └── roleMiddleware.js
│   │
│   ├── app.js
│   └── server.js ✅
│
├── uploads/ (auto-created)
└── package.json

client/
├── src/
│   ├── pages/
│   │   ├── Deposit.jsx ✅
│   │   └── ...
│   ├── components/
│   ├── context/
│   └── App.jsx
└── package.json

admin/
├── src/
│   ├── pages/
│   │   ├── DepositRequests.jsx ✅
│   │   ├── QRManagement.jsx ✅
│   │   ├── AllUsers.jsx
│   │   └── ...
│   ├── components/
│   ├── context/
│   └── App.jsx
└── package.json
```

---

## Deployment Checklist

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong_password
NODE_ENV=production
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=https://api.yourdomain.com/
```

### Admin (.env)
```
VITE_API_URL=https://api.yourdomain.com/
```

### Server Startup Checklist
- ✅ Uploads folder auto-created by both upload.js and server.js
- ✅ Global error handler catches all exceptions
- ✅ Static serving at `/uploads` and `/api/uploads`
- ✅ CORS configured for all origins
- ✅ MongoDB connected before listening
- ✅ Socket.IO configured for real-time
- ✅ All routes mounted at `/api` prefix

### Testing Checklist

**Deposits**:
- ✅ Submit UPI deposit → saved in DB
- ✅ Submit Crypto deposit → saved with address
- ✅ Admin approve → wallet balance updated
- ✅ Admin reject → user notified
- ✅ Notification sent on approval
- ✅ Notification sent on rejection

**QR Codes**:
- ✅ Upload UPI QR → saved with image URL
- ✅ Upload Crypto QR → saved with network, address
- ✅ Load QRs in Deposit page
- ✅ Display addresses in user QRs
- ✅ Delete QR → file and DB record removed
- ✅ Admin can manage all QRs

**Notifications**:
- ✅ Broadcast to all users
- ✅ Send to specific user
- ✅ Real-time via Socket.IO
- ✅ Mark as read
- ✅ Fetch user notifications
- ✅ Admin can create manually

---

## Error Handling

All endpoints return standard JSON responses:

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* ... */ },
  "count": 10
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_details"
}
```

**HTTP Status Codes**:
- 200: OK
- 201: Created
- 400: Bad Request (validation)
- 404: Not Found
- 500: Server Error

---

## Security Features

✅ **Authentication**: JWT tokens  
✅ **Authorization**: Role-based access control (admin, superadmin)  
✅ **File Upload**: MIME type validation, size limits, randomized filenames  
✅ **Folder Permissions**: Auto-check for folder writeability  
✅ **Input Validation**: All required fields validated  
✅ **Error Handling**: No stack traces in production  
✅ **CORS**: Configurable whitelist of origins  
✅ **MongoDB**: ObjectId validation for all queries  

---

## Production Notes

1. **Uploads Folder**: Must be writable and exist on production server
2. **Static Serving**: Dual paths (`/uploads` and `/api/uploads`) for compatibility
3. **File Deletion**: Uses `fs.existsSync()` before unlinkSync() to avoid crashes
4. **Global Error Handler**: 4-param middleware catches all multer and thrown errors
5. **Socket.IO**: Configured for cross-origin, emits to specific user rooms
6. **Notifications**: Stored in DB + emitted real-time via Socket.IO
7. **Database**: Ensure MongoDB indexes on userId, status, createdAt

---

## Future Enhancements

- [ ] Add pagination to deposit/notification lists
- [ ] Add export to CSV for deposits
- [ ] Add email notifications (via Nodemailer)
- [ ] Add SMS notifications (via Twilio)
- [ ] Add webhook for payment partners
- [ ] Add deposit history charts
- [ ] Add bulk approve/reject
- [ ] Add QR code regeneration
- [ ] Add crypto price tracking
- [ ] Add GST calculation

---

**Last Updated**: February 14, 2026  
**Status**: Production Ready ✅
