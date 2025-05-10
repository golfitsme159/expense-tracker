# Expense Tracker API

## Auth

### POST /auth/register
- Request: `{ data: <AES encrypted { email, password } string> }`
- Response: `{ data: <AES encrypted { id, email }> }`

### POST /auth/login
- Request: `{ data: <AES encrypted { email, password } string> }`
- Response: `{ data: <AES encrypted { token }> }`

---

## Expenses

### GET /expenses
- Header: Authorization Bearer <JWT>
- Response: `{ data: <AES encrypted array of expenses> }`

### POST /expenses
- Request: `{ data: <AES encrypted { title, amount, category, date }> }`

### GET /expenses/:id
- Header: Authorization Bearer <JWT>
- Response: `{ data: <AES encrypted single expense> }`

### PUT /expenses/:id
- Header: Authorization Bearer <JWT>
- Request: `{ data: <AES encrypted { title?, amount?, category?, date? }> }`
- Response: `{ data: <AES encrypted updated expense> }`

### DELETE /expenses/:id
- Header: Authorization Bearer <JWT>
- Response: `{ message: 'Deleted successfully' }`

---

## Security Notes

- All request/response bodies are AES-256 encrypted between frontend/backend.
- Token authentication uses JWT with 1-hour expiry.
- Passwords are hashed using bcrypt.
- Rate limiting is applied to /auth/login (max 5 per minute per IP).
- Encrypted fields must be stringified JSON before AES encryption.

---

## Error Format

All errors return HTTP status code with JSON body:
```json
{
  "message": "Error message"
}
```

---

## Activity Logging

The system logs user activity (create/update/delete/read) for all endpoints tied to a userId.