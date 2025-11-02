# HW2: RESTful API with Node.js, Express, MongoDB (DC Crime Data)

**Repo:** https://github.com/Krishana7599/hw2-backend

A small backend that loads DC crime incidents (GeoJSON) into MongoDB and exposes:
- Full CRUD for `crimes`
- Eight analytical “question” endpoints (matching HW1)

## Dataset
Source (HW1): DC Open Data – Crime Incidents (2024–2025)  
Seed script downloads and loads the data into MongoDB.

## Tech
- Node.js + Express
- MongoDB (local by default: `mongodb://127.0.0.1:27017/hw2`)
- Mongoose
- Jest + Supertest (unit tests)

## Setup

```bash
# Install dependencies
npm i

# (Optional) Seed the database (downloads DC data + inserts)
node scripts/seed.js

# Run tests (CRUD + questions)
npm test

# Run in dev mode (nodemon)
npm run dev

