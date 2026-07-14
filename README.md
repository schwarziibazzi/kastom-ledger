# Kastom Ledger - Digital Estate & Inheritance Management Platform

##  Overview

Kastom Ledger is a comprehensive digital platform designed to preserve family legacy, inheritance intentions, and important personal records for Papua New Guinea. The system provides individuals with a secure, tamper-evident way to record their legacy, verify their identity, nominate trusted successors, and preserve important information for future generations.

The platform is built on the principle that it does not replace customary law, legal inheritance processes, or family decision-making. Instead, it serves as a preservation tool that captures and protects evidence of intent, creating a verifiable chain of custody for important decisions using SHA-256 hashing and blockchain-inspired ledger technology.

---

##  Key Features

### Role-Based Access Control
- **Inheritance Owner**: Full estate management, asset registry, beneficiary management, digital will creation, witness requests, ledger timeline
- **Beneficiary/Heir**: View-only access to inherited estates, assets, documents, and messages
- **Witness**: Review and approve/reject witness verification requests
- **Administrator**: System management, user oversight, audit logs, reports

### Estate Management
- Create and manage multiple estates
- Track estate completion percentage
- Visual workflow from creation to completion
- Estate status tracking (Draft, Active, Pending Witness, Verified, Finalised, etc.)

### Asset Registry
- Support for multiple asset types (House, Land, Vehicle, Business, Livestock, Savings, Investments, Shares, Digital Assets, Family Heirlooms, Documents)
- Estimated value, location tracking, and beneficiary assignment
- Document attachments per asset

### Digital Will Builder
- Multi-step guided process
- Introduction, executor notes, personal messages
- Audio recording for each section
- Witness management (minimum 2 witnesses required)
- Automatic PDF generation with tamper-evident seal
- Cryptographic signing and verification

### Beneficiary Management
- Add beneficiaries with name and email
- Auto-detect existing users vs. new users
- Invitation system for unregistered beneficiaries
- Invitation token for claiming with SevisPass
- Share percentage allocation

### Document Management
- Category-based organization (Legacy, Estate, Asset, Will Audio, Profile, General)
- Upload PDFs, Images, Audio files
- Preview, Download, Delete functionality
- Grid/List view toggle
- Search and filter capabilities
- Storage statistics

### Ledger & Security
- SHA-256 hashing for all actions
- Blockchain-inspired chain linking
- Tamper-evident digital ledger
- PDF digital signatures with HMAC-SHA256
- Verification codes on documents
- Document checksum verification

### Notifications
- Real-time notifications for all system events
- Mark as read/unread
- Filter by read/unread status
- Click to view details

### Search
- Global search across estates, assets, beneficiaries, documents
- Role-aware search results
- Recent searches saved
- Live search results

### Authentication
- Mock SevisPass OAuth/OIDC flow
- Role-based dashboard routing
- User signup with role selection
- Secure JWT authentication

---

##  Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL / SQLite
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **File System**: fs-extra
- **Hashing**: Crypto (SHA-256)

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

##  Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (or SQLite for development)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/schwarziibazzi/kastom-ledger.git
cd kastom-ledger
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# For PostgreSQL:
# DATABASE_URL="postgresql://username:password@localhost:5432/kastom_ledger"

# Setup database
npx prisma db push
npx prisma generate

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/kastom_ledger"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
NODE_ENV="development"
BASE_URL="http://localhost:5000"
```

---

##  Database Schema

### Core Models
- **User**: System users with SevisPass authentication
- **Estate**: Inheritance estates owned by users
- **Asset**: Assets within an estate (property, vehicles, etc.)
- **Beneficiary**: Nominated heirs with invitation tracking
- **DigitalWill**: Complete will with text and audio
- **WillWitness**: Witnesses for digital will
- **Document**: Uploaded files with checksums
- **AudioFile**: Audio recordings with metadata
- **LedgerEntry**: Tamper-evident action log
- **Notification**: User notifications
- **Folder**: Document organization

---

##  Security Features

### Implemented Security Measures
1. **SHA-256 Hashing**: All ledger entries and documents are hashed
2. **Digital Signatures**: PDFs are signed with HMAC-SHA256
3. **Tamper-Evident Seal**: PDFs include verification codes
4. **Document Checksums**: File integrity verification
5. **JWT Authentication**: Secure session management
6. **Role-Based Access Control**: Strict permission system
7. **Rate Limiting**: Protection against abuse
8. **CORS Protection**: Controlled cross-origin access
9. **Helmet.js**: Security headers
10. **File Upload Validation**: Type and size restrictions

### Document Verification
- Each PDF has a verification code
- Documents can be verified via API
- Checksum stored in database
- Ledger entry reference maintained

---

## 👥 User Roles

### Inheritance Owner
- Create and manage estates
- Add and edit assets
- Nominate beneficiaries
- Create digital will
- Request witness verification
- View ledger timeline
- Manage documents
- Record audio messages

### Beneficiary / Heir
- View inherited estates
- View allocated assets
- Access shared documents
- Receive messages from owner
- View-only access (no editing)

### Witness
- View pending verification requests
- Approve or reject requests
- View approval history
- View rejection history

### Administrator
- Manage users
- View system activity logs
- Audit trail access
- System analytics and reports
- User role management

---

##  Project Structure

```
kastom-ledger/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── estate.controller.js
│   │   │   ├── assets.controller.js
│   │   │   ├── beneficiaries.controller.js
│   │   │   ├── will.controller.js
│   │   │   ├── documents.controller.js
│   │   │   ├── witness.controller.js
│   │   │   ├── ledger.controller.js
│   │   │   └── notification.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── estate.routes.js
│   │   │   ├── assets.routes.js
│   │   │   ├── beneficiaries.routes.js
│   │   │   ├── will.routes.js
│   │   │   ├── documents.routes.js
│   │   │   └── witness.routes.js
│   │   ├── services/
│   │   │   ├── pdf.service.js
│   │   │   ├── ledger.service.js
│   │   │   └── notification.service.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/
│   ├── pdfs/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── RoleBasedLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── owner/
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── EstatePage.jsx
│   │   │   │   ├── AssetsPage.jsx
│   │   │   │   ├── BeneficiariesPage.jsx
│   │   │   │   ├── DigitalWillPage.jsx
│   │   │   │   └── WitnessRequestsPage.jsx
│   │   │   ├── beneficiary/
│   │   │   │   ├── BeneficiaryDashboard.jsx
│   │   │   │   ├── BeneficiaryEstateView.jsx
│   │   │   │   └── BeneficiaryAssets.jsx
│   │   │   ├── witness/
│   │   │   │   ├── WitnessDashboard.jsx
│   │   │   │   └── WitnessRequestDetail.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   └── ActivityLogsPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Ledger.jsx
│   │   │   └── NotificationsPage.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── RoleProvider.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

##  API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sevispass/login` | Login with SevisPass |
| POST | `/api/auth/signup` | Create new user |
| GET | `/api/auth/profile` | Get user profile |
| GET | `/api/auth/role` | Get user role |
| POST | `/api/auth/logout` | Logout user |

### Estates
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/estates` | Create estate |
| GET | `/api/estates` | Get all estates |
| GET | `/api/estates/:id` | Get estate by ID |
| PUT | `/api/estates/:id` | Update estate |
| DELETE | `/api/estates/:id` | Delete estate |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assets` | Create asset |
| GET | `/api/assets` | Get all assets |
| GET | `/api/assets/:id` | Get asset by ID |
| PUT | `/api/assets/:id` | Update asset |
| DELETE | `/api/assets/:id` | Delete asset |

### Beneficiaries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/beneficiaries` | Add beneficiary |
| GET | `/api/beneficiaries` | Get all beneficiaries |
| GET | `/api/beneficiaries/:id` | Get beneficiary by ID |
| PUT | `/api/beneficiaries/:id` | Update beneficiary |
| DELETE | `/api/beneficiaries/:id` | Delete beneficiary |
| POST | `/api/beneficiaries/:id/claim` | Claim invitation |

### Digital Will
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/will` | Create digital will |
| GET | `/api/will` | Get all wills |
| GET | `/api/will/:id` | Get will by ID |
| PUT | `/api/will/:id` | Update will |
| DELETE | `/api/will/:id` | Delete will |
| POST | `/api/will/:id/submit` | Submit will with PDF generation |
| POST | `/api/will/:id/generate-pdf` | Generate PDF only |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents` | Get all documents |
| GET | `/api/documents/:id` | Get document by ID |
| GET | `/api/documents/:id/download` | Download document |
| GET | `/api/documents/:id/verify` | Verify document integrity |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/audio` | Save audio file |
| GET | `/api/documents/audio` | Get audio files |

### Witness
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/witness/requests` | Get witness requests |
| GET | `/api/witness/approved` | Get approved requests |
| GET | `/api/witness/rejected` | Get rejected requests |
| POST | `/api/witness/:id/approve` | Approve request |
| POST | `/api/witness/:id/reject` | Reject request |

### Ledger
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ledger` | Get user ledger |
| GET | `/api/ledger/stats` | Get ledger stats |
| GET | `/api/ledger/verify/:uid` | Verify ledger integrity |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/notifications/count` | Get unread count |

---

##  Testing Accounts

Use these mock SevisPass UIDs to test different roles:

| UID | Name | Role | Province |
|-----|------|------|----------|
| MOCK-UID-001 | John Kasi | OWNER | National Capital District |
| MOCK-UID-002 | Mary Wama | BENEFICIARY | Morobe Province |
| MOCK-UID-003 | Peter Tau | WITNESS | Eastern Highlands Province |
| MOCK-UID-004 | Sarah Kila | BENEFICIARY | West New Britain Province |
| MOCK-UID-005 | Admin User | ADMINISTRATOR | National Capital District |

---

##  License

This project is proprietary and confidential.

---

##  Acknowledgments

- Papua New Guinea's SevisPass team for identity verification framework
- Pacific Islands Development Program
- Kastom and tradition keepers of Papua New Guinea

---

## Version History

### v1.0.0 (Current)
- ✅ Complete estate management system
- ✅ Digital Will with PDF generation
- ✅ Role-based access control (4 roles)
- ✅ Asset registry with multiple types
- ✅ Beneficiary management with invitations
- ✅ Document management with categories
- ✅ SHA-256 tamper-evident ledger
- ✅ Digital signatures and checksums
- ✅ Notifications system
- ✅ Global search
- ✅ Audio recording for wills
- ✅ Responsive mobile-first design
- ✅ SevisPass mock authentication
- ✅ Government-grade premium UI

---

##  Development Commands

### Backend
```bash
# Development
npm run dev

# Database
npx prisma db push      # Push schema changes
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open Prisma Studio
npm run db:seed         # Seed database

# Production
npm start
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with ❤️ for Papua New Guinea**
