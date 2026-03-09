# API Contracts: Translate & Personalize Endpoints

**Feature**: `012-fix-translate-personalize-404`  
**Date**: 2026-03-09

These contracts are **unchanged** by this feature. The fix is a backend configuration/path resolution issue — the API contracts remain identical. This document records expected behavior post-fix.

## POST /api/translate

**Purpose**: Translate a chapter from English to Urdu with code-block preservation.

### Request

```json
{
  "chapter_slug": "module1-ros2/01-architecture",
  "force_refresh": false
}
```

**Headers**: Cookie `token=<JWT>` (required)

### Response (200 OK)

```json
{
  "translated_content": "<Urdu markdown content>",
  "original_code_blocks": ["```python\nimport rclpy\n```"]
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Invalid slug format | `{"detail": "Invalid chapter_slug format"}` |
| 401 | No/invalid/expired JWT | `{"detail": "not_authenticated\|session_expired\|invalid_token"}` |
| 404 | Chapter file not found | `{"detail": "Chapter not found: <slug>"}` |
| 429 | Rate limit (10 req/min/IP) | `{"detail": "Rate limit exceeded..."}` |
| 503 | All AI providers down | `{"detail": "All AI providers are temporarily unavailable..."}` |

---

## POST /api/personalize

**Purpose**: Personalize chapter content based on user's learning profile.

### Request

```json
{
  "chapter_slug": "module1-ros2/01-architecture"
}
```

**Headers**: Cookie `token=<JWT>` (required)

### Response (200 OK)

```json
{
  "personalized_content": "<personalized markdown content>"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Invalid slug format | `{"detail": "Invalid chapter_slug format"}` |
| 401 | No/invalid/expired JWT | `{"detail": "not_authenticated\|session_expired\|invalid_token"}` |
| 404 | Chapter file not found | `{"detail": "Chapter not found"}` |
| 429 | AI rate limit | `{"detail": "AI service rate limit reached..."}` |
| 503 | All AI providers down | `{"detail": "All AI providers are temporarily unavailable..."}` |

---

## Contract Verification

Post-fix, both endpoints should return 200 for all 18 valid slugs:

```
intro/index
module1-ros2/01-architecture
module1-ros2/02-nodes-topics-services
module1-ros2/03-python-packages
module1-ros2/04-launch-files
module1-ros2/05-urdf
module2-simulation/chapter1-gazebo-basics
module2-simulation/chapter2-gazebo-ros2-integration
module2-simulation/chapter3-unity-robotics
module2-simulation/chapter4-unity-ml-agents
module3-isaac/chapter1-isaac-sim-intro
module3-isaac/chapter2-isaac-gym
module3-isaac/chapter3-isaac-ros2-bridge
module3-isaac/chapter4-isaac-reinforcement-learning
module4-vla/chapter1-vla-intro
module4-vla/chapter2-multimodal-models
module4-vla/chapter3-action-chunking
module4-vla/chapter4-vla-robotics
```
