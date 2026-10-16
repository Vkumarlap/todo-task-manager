# To-Do Task Manager

Full-stack task manager built with React + Vite, Spring Boot (Java 17), Spring Data JPA, and MySQL.

## Features
- Create, view, edit, delete tasks
- Pending / Completed status
- Low / Medium / High priority
- Search by title and description
- Filter by status and priority
- Overdue task highlighting
- Required-title validation and API error responses
- Responsive dashboard inspired by the supplied design
- MySQL persistence

## Requirements
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+

## 1. Create the database
The application can create the database automatically if the configured MySQL user has permission:
```sql
CREATE DATABASE IF NOT EXISTS todo_manager;
```

## 2. Configure backend
Edit `backend/src/main/resources/application.properties` and set your MySQL username/password.
The defaults are `root` and `change_me`. Do not commit real credentials to a public repository.

Run:
```bash
cd backend
mvn spring-boot:run
```
API base URL: `http://localhost:8080/api/tasks`

## 3. Run frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The frontend uses `VITE_API_BASE_URL` if set; otherwise it calls `http://localhost:8080/api/tasks`.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/tasks` | Create |
| GET | `/api/tasks` | List; optional `status`, `priority`, `search` query parameters |
| GET | `/api/tasks/{id}` | Read one |
| PUT | `/api/tasks/{id}` | Replace editable fields |
| PATCH | `/api/tasks/{id}/status` | Update status |
| DELETE | `/api/tasks/{id}` | Delete |

Example create payload:
```json
{
  "title": "Finish project",
  "description": "Complete and test the task manager",
  "dueDate": "2026-10-20",
  "priority": "HIGH",
  "status": "PENDING"
}
```

## Notes
- Hibernate uses `ddl-auto=update` for development. For production, use schema migrations such as Flyway.
- CORS is configured for local Vite development (`http://localhost:5173`).
- This starter does not include authentication or multi-user assignment.
