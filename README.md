# 🐦 Twitter Clone – Server

This is the backend server for the Twitter Clone app, built with GraphQL and Redis/PostgreSQL. It handles user authentication, tweet creation, follow/unfollow logic, and more.

## 🧰 Tech Stack

- **Node.js** with **TypeScript**
- **GraphQL** (Apollo Server)
- **Redis** – for tweet caching and fast access
- **PostgreSQL** – for persistent storage (users, followers, etc.)
- **JWT Authentication**
- **GraphQL Codegen** – for type-safe APIs


## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/twitter-clone-server.git
cd twitter-clone-server
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Environment variables

Set up resources.

Create a .env file.
```bash
DATABASE_URL="postgresql://postgres.[postgres_url_goes_here]/postgres"
AWS_ACCESS_KEY_ID=ID_GOES_HERE
AWS_SECRET_ACCESS_KEY=secret_access_key_GOES_HERE
AWS_DEFAULT_REGION=region_GOES_HERE
AWS_S3_BUCKET=bucketName_GOES_HERE
REDIS_URL=rediss://[url_goes_here]
```

### 4. Run the server

```bash
npm run dev
# or
yarn dev
```

### 5. GraphQL Playground
Visit: http://localhost:8000/graphql
