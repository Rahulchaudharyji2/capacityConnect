# Capacity Connect

Capacity Connect is an AI-powered organizational learning and skills platform designed to bridge the gap between learner capabilities and curriculum effectiveness. Built for robust authorization, real-time analytics, and personalized recommendations, this platform leverages deterministic application logic paired securely with Generative AI.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Strict boundaries between Learners, Trainers, and Admins. Cross-organizational data is fully isolated.
*   **Hybrid RAG Architecture:** Vector similarity search (via PostgreSQL + pgvector) augmented by deterministic keyword retrieval, enabling precise and grounded AI learning assistance from authorized PDFs and resources.
*   **AI Learning Assistant:** A contextual chatbot that answers learner questions strictly grounded in the authorized course material they are currently enrolled in.
*   **AI Assessment & Quiz Generation:** Generates multi-choice questions dynamically from authorized learning materials. Scoring and answers are heavily protected server-side.
*   **AI Skill Gap Analysis:** Mathematically tracks learner accuracy across competencies and utilizes AI to explain areas needing attention based on deterministic evidence.
*   **Personalized Learning Recommendations:** Recommends next-step lessons, courses, and practice materials based on active skill gaps and the user's current learning plan.
*   **Trainer Insights:** Aggregates cohort performance across courses, utilizing AI to offer instructional insights (e.g., "70% of the cohort is struggling with Data Visualization") without exposing learner PII to the LLM.
*   **Production-Hardened Security:** Distributed Redis rate limiting, rigorous prompt-injection defense, secure JWT session management, and comprehensive structured audit logging.

## 🛠 Tech Stack

*   **Framework:** [Next.js (App Router)](https://nextjs.org) + TypeScript
*   **Styling:** [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
*   **Database:** PostgreSQL (with `pgvector` extension) or SQLite (for local dev without vector capabilities)
*   **ORM:** [Prisma](https://www.prisma.io)
*   **Cache & Rate Limiting:** Redis
*   **Generative AI:** Google Gemini (via `@google/generative-ai`)
*   **Authentication:** Custom JWT-based stateless sessions (`jose`)

## ⚙️ Local Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18+)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   (Optional but recommended for full RAG) A local or hosted PostgreSQL instance with the `pgvector` extension installed. *Note: By default, the local configuration uses SQLite for rapid prototyping.*
*   (Optional) Redis server for distributed rate limiting.

### 2. Clone the Repository
```bash
git clone <repository_url>
cd capacity-connect
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root of the project (if it doesn't already exist) and populate it with the required secrets:

```env
# Database Configuration (SQLite path for local dev, or Postgres URL for prod)
DATABASE_URL="file:./dev.db"

# Public App URL for consistent routing
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Security: JWT Secret must be cryptographically secure and at least 32 characters long
JWT_SECRET="your_32_character_long_super_secret_key"

# AI Integration
GEMINI_API_KEY="your_gemini_api_key_here"

# Rate Limiting & Caching (Requires a running Redis instance)
REDIS_URL="redis://localhost:6379"
```

### 5. Initialize the Database
Push the Prisma schema to your local database to create the necessary tables:
```bash
npx prisma db push
```

Generate the Prisma Client:
```bash
npx prisma generate
```

### 6. Seed Demo Data (Optional but Recommended)
Populate the database with fictional organizations, learners, trainers, courses, and generated assessment metrics so you can immediately interact with the platform:
```bash
npx ts-node prisma/seed.ts
```
*Note: This creates mock accounts that you can use to log in and view dynamic skill gaps and recommendations.*

### 7. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring the platform.

## 🧪 Evaluation & Testing
Capacity Connect utilizes dedicated evaluation scripts to monitor the correctness and security of its AI features.

Run these scripts (if implemented locally) to test the integrity of the subsystems:
*   `npm run evaluate:rag` - Tests Hybrid RAG recall/precision and authorization boundaries.
*   `npm run evaluate:assessment` - Validates JSON schemas and checks that hallucinated questions are dropped.
*   `npm run evaluate:skills` - Asserts that the deterministic Evidence Engine overrides AI status interpretation.
*   `npm run evaluate:recommendations` - Checks that users cannot receive unauthorized lesson recommendations.
*   `npm run evaluate:insights` - Verifies no learner PII leaks into the Trainer AI payload.

## 🔒 Security Principles
1.  **Authorization precedes AI:** AI is only fed context it is explicitly authorized to view.
2.  **Deterministic Truth:** All scoring, grading, and competency state management happens rigidly in the database and Next.js backend, not in the LLM.
3.  **Strict Bounding:** Generative AI is used exclusively for explanation, summarization, and parsing, never for identity control.
