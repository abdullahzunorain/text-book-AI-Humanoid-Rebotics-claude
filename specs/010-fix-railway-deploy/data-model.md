# Data Model: Fix Railway Backend Deployment

**Feature**: `010-fix-railway-deploy` | **Date**: 2026-03-09

## Overview

This feature does NOT modify any database tables or create new entities. It fixes deployment configuration and connection handling for existing tables. This document captures the existing data model for reference and the state transitions relevant to the deployment fix.

## Existing Entities (No Changes)

### users

| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### user_backgrounds

| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | FK → users(id), UNIQUE, NOT NULL |
| python_level | VARCHAR(20) | CHECK IN (beginner, intermediate, advanced) |
| robotics_experience | VARCHAR(20) | CHECK IN (none, hobbyist, student, professional) |
| math_level | VARCHAR(20) | CHECK IN (high_school, undergraduate, graduate) |
| hardware_access | BOOLEAN | DEFAULT FALSE |
| learning_goal | TEXT | max 200 chars |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### content_cache

| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | FK → users(id), NOT NULL |
| chapter_slug | VARCHAR(200) | NOT NULL |
| cache_type | VARCHAR(20) | CHECK IN (personalization, translation) |
| content | TEXT | NOT NULL |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Unique constraint**: (user_id, chapter_slug, cache_type)

### chat_messages

| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | FK → users(id), NOT NULL |
| question | TEXT | NOT NULL |
| answer | TEXT | NOT NULL |
| selected_text | TEXT | nullable |
| sources | JSONB | DEFAULT '[]' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## State Transitions: DB Connection Pool

This feature changes the DB pool lifecycle. The state diagram below captures the new behavior:

```
┌─────────────┐     Railway wake     ┌─────────────┐
│  No Process  │ ──────────────────→  │  Process Up  │
│  (sleeping)  │                      │  _pool=None  │
└─────────────┘                       └──────┬───────┘
                                             │
                                   healthcheck /health
                                   (no DB needed) ✅
                                             │
                                   first DB-dependent request
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  ensure_pool  │
                                      │  _pool=Pool   │
                                      └──────┬────────┘
                                             │
                                      DB queries work ✅
                                             │
                                   Railway sleep (no traffic)
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  close_pool   │
                                      │  _pool=None   │
                                      └──────┬────────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │  No Process  │
                                      │  (sleeping)  │
                                      └─────────────┘
```

## Migration Runner Model

The migration runner reads SQL files from `backend/migrations/` and executes them via `asyncpg`. No migration tracking table is used — all SQL scripts are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

**Migration execution order**: Sorted alphabetically by filename (001, 002, ...).

**Migration files** (existing, unchanged):
- `001_create_auth_tables.sql` — users + user_backgrounds
- `002_add_cache_and_chat.sql` — content_cache + chat_messages

## Validation Rules

No changes. Existing validation rules enforced by Postgres CHECK constraints and application-level Pydantic models remain unchanged.
