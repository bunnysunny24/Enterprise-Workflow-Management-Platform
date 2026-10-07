# Enterprise Workflow Management Platform

[![Java 17](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-blue.svg)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, full-stack business automation engine developed with **Java 17, Spring Boot, React, JavaScript, and MySQL**. The platform delivers a robust, configurable state-machine architecture to digitize and automate multi-user business processes with persistent workflow state, role-based authorization, immutable compliance audit trails, and strict SLA tracking.

---

## 🌟 Resume Highlights & Core Achievements

- **Full-Stack Business Architecture**: Developed a production-ready enterprise platform using **Java, Spring Boot, React, JavaScript, and MySQL**, exposing RESTful APIs to automate configurable multi-user workflows and business processes.
- **Role-Based Access Control (RBAC) & JWT Security**: Implemented multi-tier authentication (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`, `ROLE_AUDITOR`) with stateless JWT tokens, BCrypt password encryption, method-level authorization (`@PreAuthorize`), and context-aware action permissions.
- **Configurable State Machine & Relational Data Models**: Engineered relational schemas (`users`, `workflow_definitions`, `workflow_steps`, `workflow_instances`, `workflow_audit_logs`) supporting dynamic multi-stage pipelines, timeout SLAs, form payloads, and sequential/conditional step transitions.
- **Enterprise Reliability & Validation**: Enforced centralized global exception handling (`@RestControllerAdvice`), Jakarta Bean Validation, standardized RFC-style `ApiResponse<T>` envelopes, and complete audit logging of every state mutation with duration metrics.
- **Interactive Single-Page React Console**: Built an executive dashboard featuring real-time KPI metrics, pending approvals queue, 1-click persona switcher, visual multi-stage progress timelines, and a workflow definition designer.

---

## 🏗️ System Architecture & Workflow Engine

```
                                  +-------------------------------------------------+
                                  |            React Client (Vite + SPA)            |
                                  |  - Executive Dashboard & SLA Telemetry          |
                                  |  - Approvals Inbox & 1-Click Persona Switcher   |
                                  |  - Interactive Stepper & Audit Log Viewer       |
                                  +------------------------+------------------------+
                                                           |
                                                HTTPS / JSON REST APIs
                                                 (Bearer JWT Tokens)
                                                           |
                                                           v
                                  +-------------------------------------------------+
                                  |         Spring Boot 3.3.0 REST Backend          |
                                  +-------------------------------------------------+
                                  |  [Security Filter Chain] -> JWT Authentication  |
                                  |  [Controllers] -> REST Endpoints (/api/**)     |
                                  |  [Service Layer] -> State Machine Engine        |
                                  |  [Exception Advice] -> Global Error Responses   |
                                  |  [Audit Interceptor] -> Immutable Event Logger  |
                                  +------------------------+------------------------+
                                                           |
                                                  Hibernate / Spring Data
                                                  JPA Entities & Queries
                                                           |
                                                           v
                                  +-------------------------------------------------+
                                  |             MySQL 8.0 Relational DB             |
                                  |  users | user_roles | workflow_definitions      |
                                  |  workflow_steps | workflow_instances | audit    |
                                  +-------------------------------------------------+
```

### Workflow State Progression Lifecycle

```
   [Initiator: EMPLOYEE] 
            │
            ▼
    [1. SUBMISSION]  ────▶ (Instance created, tracking # issued, SLA countdown begins)
            │
            ▼
   [2. MANAGER REVIEW] ──▶ (Reviewed against team budget & deliverables)
            │
            ├─── Action: APPROVE ────────┐
            ├─── Action: REQUEST_CHANGES ───▶ (Returns to SUBMISSION)
            └─── Action: REJECT ─────────┐
                                         │
            ┌────────────────────────────┘
            ▼
   [3. COMPLIANCE / FINANCE] ──▶ (Audited against compliance rules)
            │
            ├─── Action: APPROVE ────▶ [4. APPROVED / COMPLETED]
            └─── Action: REJECT ─────▶ [TERMINAL: REJECTED]
```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Persona / Role | Example User | Permissions & Responsibilities |
|---|---|---|
| **`ROLE_ADMIN`** | `admin` | Full system governance, template creation, overriding any action, system metrics. |
| **`ROLE_MANAGER`** | `sarah.manager`, `mark.finance` | Reviewing line-item requests, approving/rejecting department submissions, assigning tasks. |
| **`ROLE_EMPLOYEE`** | `alex.employee` | Creating requests (Expense, IT, Leave), viewing my submissions, tracking history. |
| **`ROLE_AUDITOR`** | `elena.auditor` | Compliance verification, inspecting immutable audit logs, validating SLA compliance. |

---

## 📦 Pre-Configured Enterprise Workflows

1. **Corporate Expense Reimbursement (`EXPENSE_REIMBURSEMENT`)**:
   - Stages: `Submit Expense` &rarr; `Line Manager Review` &rarr; `Finance Disbursal Approval` &rarr; `Settled`.
   - SLA: 48 Hours.
2. **IT Security & Cloud Access Provisioning (`IT_ACCESS_PROVISION`)**:
   - Stages: `Access Request Submission` &rarr; `Team Lead Review` &rarr; `Security & Compliance Audit` &rarr; `SysAdmin Provisioned`.
   - SLA: 24 Hours.
3. **Annual Leave & Sabbatical Request (`LEAVE_REQUEST`)**:
   - Stages: `Submit Leave Schedule` &rarr; `Department Head Approval` &rarr; `HR Calendar Recorded`.
   - SLA: 72 Hours.

---

## 📊 Database Schema (Relational Data Model)

- **`users`**: User identity, hashed BCrypt credentials, department, job title, account status.
- **`user_roles`**: Join table mapping `user_id` to enumerated roles.
- **`workflow_definitions`**: Business process master catalog (code, name, description, SLA target, dynamic form schema).
- **`workflow_steps`**: Ordered sequence of pipeline stages, required authority roles, timeouts, and step types.
- **`workflow_transitions`**: Allowed directional transitions between states based on action names (`APPROVE`, `REJECT`, `REQUEST_CHANGES`).
- **`workflow_instances`**: Persistent execution instances tracking unique tracking code (`WF-EXP-2026-XXXX`), initiator, assignee, current stage, priority, JSON payload, and status.
- **`workflow_audit_logs`**: Tamper-evident transition records containing step name, actor, previous state, new state, comments, and duration in minutes.

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** (OpenJDK or Oracle)
- **Node.js 18+** & **npm 9+**
- **MySQL 8.0+** running locally (or Docker)

### 1. Database Configuration
Open MySQL and create the database:
```sql
CREATE DATABASE enterprise_workflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update your database credentials in `backend/src/main/resources/application.yml` or set environment variables:
```bash
export DB_USERNAME=root
export DB_PASSWORD=your_password
```

### 2. Run Backend (Spring Boot)
```bash
cd backend
# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux/macOS:
./mvnw spring-boot:run
```
The REST API starts on `http://localhost:8080`. Automatic seeding triggers on first launch to populate test users and workflow definitions.

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Credentials

Click any of the quick-login persona cards on the login screen or use:

| User | Username | Password | Default Role |
|---|---|---|---|
| Alexander Wright (CIO) | `admin` | `Admin@123` | `ROLE_ADMIN` |
| Sarah Chen (Director) | `sarah.manager` | `Manager@123` | `ROLE_MANAGER` |
| Alex Miller (Senior Dev) | `alex.employee` | `Employee@123` | `ROLE_EMPLOYEE` |
| Elena Rostova (Auditor) | `elena.auditor` | `Auditor@123` | `ROLE_AUDITOR` |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` &mdash; Authenticate user, returns Bearer JWT.
- `POST /api/auth/register` &mdash; Register new enterprise user.
- `GET /api/auth/me` &mdash; Current user profile and authorities.

### Workflow Definitions
- `GET /api/workflows/definitions` &mdash; List all workflow blueprints.
- `GET /api/workflows/definitions/active` &mdash; List active blueprints.
- `POST /api/workflows/definitions` &mdash; Create new workflow blueprint (*Admin only*).
- `GET /api/workflows/definitions/{id}` &mdash; Get blueprint with ordered stages.

### Workflow Instances & Execution
- `GET /api/workflows/instances` &mdash; Query all workflow instances.
- `GET /api/workflows/instances/{id}` &mdash; Inspect single instance state and permissible actions.
- `POST /api/workflows/instances` &mdash; Initiate new workflow request.
- `POST /api/workflows/instances/{id}/action` &mdash; Execute workflow transition (`APPROVE`, `REJECT`, `REQUEST_CHANGES`, `ESCALATE`, `CANCEL`).
- `GET /api/workflows/instances/pending-approvals` &mdash; User's actionable approval inbox.
- `GET /api/workflows/instances/my-submissions` &mdash; User's initiated requests.

### Audit & Analytics
- `GET /api/workflows/audit/instance/{instanceId}` &mdash; Immutable audit trail for an instance.
- `GET /api/workflows/audit/recent` &mdash; Recent corporate audit entries.
- `GET /api/workflows/analytics/metrics` &mdash; Executive KPIs (Total, In-flight, SLAs, Velocity).

---

## 🐳 Docker Deployment

To launch the full stack (MySQL, Spring Boot, React with Nginx) via Docker Compose:
```bash
docker-compose up --build -d
```
Access the application at `http://localhost:5173`.

---

## 🛡️ Engineering Quality & Security

- **Centralized Validation**: Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Size`) prevents malformed requests.
- **Standardized API Contract**: Universal `ApiResponse<T>` wraps all payloads, error details, and timestamps.
- **Stateless Token Management**: Encrypted JWT with secret signing and sub-claim extraction.
- **SLA Breach Monitoring**: Real-time evaluation comparing current timestamp against computed deadline.
- **Relational Integrity**: Foreign key constraints with cascading logic and explicit indexing.

---

## 📄 License
This project is licensed under the MIT License.
