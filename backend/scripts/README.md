# Backend scripts

## Demo data (single script)

**`create_demo_data.py`** – Seeds the database with demo users, clients, products, and work orders.

**Prerequisites:** Database migrated (`alembic upgrade head`), run from `backend` directory.

```bash
cd backend
alembic upgrade head
python scripts/create_demo_data.py
```

Or from repo root:

```bash
cd backend && python scripts/create_demo_data.py
```

**Demo logins:**

| Role     | Username   | Password |
|----------|------------|----------|
| Admin    | `admin`    | `admin123` |
| Employee | `employee1`| `demo123`  |
| Employee | `employee2`| `demo123`  |

---

## Other utilities

- **Reset user password:** `app/scripts/reset_password.py`  
  Run from backend: `python -m app.scripts.reset_password <username> <new_password>`
