# Kastom Ledger - Digital Legacy Preservation Platform

## Overview

Kastom Ledger is a SevisPass-enabled digital legacy and inheritance preservation platform designed for Papua New Guinea. It provides individuals with a secure way to record their legacy, verify their identity, nominate trusted successors, and preserve important information for future generations.

## Features

- ✅ **SevisPass Authentication** - Mock OAuth/OIDC flow with UID verification
- ✅ **Digital Legacy Profile** - Create and manage your legacy record
- ✅ **Legacy Items** - Upload documents, images, audio recordings, and text
- ✅ **Successor Management** - Nominate trusted individuals to carry on your legacy
- ✅ **Witness Confirmation** - Have important decisions verified by trusted witnesses
- ✅ **Tamper-Evident Ledger** - SHA-256 hashed chain of evidence
- ✅ **Succession Access Flow** - Controlled access after death verification

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL / SQLite
- Prisma ORM
- JWT Authentication
- Multer for file uploads
- SHA-256 for ledger hashing

### Frontend
- React + Vite
- TailwindCSS
- React Router
- Axios
- React Hot Toast

## Prerequisites

- Node.js (v16+)
- PostgreSQL (or SQLite for development)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/schwarziibazzi/kastom-ledger.git
cd kastom-ledger