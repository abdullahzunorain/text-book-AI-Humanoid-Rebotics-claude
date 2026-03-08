# E2E Test Contracts: Playwright E2E Testing & Mobile Auth Fix

**Feature**: 009-playwright-e2e-testing  
**Date**: 2026-03-08

## Overview

This feature exposes no external APIs. The contracts below define the **E2E test interface** — what each test file validates, its preconditions, and expected outcomes. These contracts ensure tests are traceable to spec requirements and reproducible.

---

## Contract 1: Auth Button Mobile Visibility

**File**: `website/e2e/auth-button-mobile.spec.ts`  
**Validates**: FR-001, FR-002, FR-015, SC-001, SC-008  
**Precondition**: Docusaurus production build served at `baseURL`

| Test | Viewport | Input | Expected Output |
|------|----------|-------|-----------------|
| Sign In visible at 375px | 375×812 | Navigate to `/` | Button `display` !== `none`, `visibility` !== `hidden` |
| Sign In visible at 768px | 768×1024 | Navigate to `/` | Button `display` !== `none`, `visibility` !== `hidden` |
| Sign In visible at 320px | 320×568 | Navigate to `/` | Button visible and clickable |
| Sign In visible at 1280px | 1280×720 | Navigate to `/` | Button visible (no desktop regression) |
| Sign In opens modal at mobile | 375×812 | Click Sign In | Auth modal appears with form fields |
| Signed-in state visible on mobile | 375×812 | Mock signed-in state | Email + Sign Out button visible, no overflow |

**Regression Guard**: If `navbar__item` class is re-added to AuthButton, the 375px and 768px tests MUST fail.

---

## Contract 2: Auth Modal Functionality & Accessibility

**File**: `website/e2e/auth-modal.spec.ts`  
**Validates**: FR-003 through FR-007, FR-013, FR-014, FR-016, FR-017, SC-002, SC-007  
**Precondition**: Docusaurus production build served at `baseURL`

| Test | Input | Expected Output |
|------|-------|-----------------|
| Tab switching | Click "Sign Up" tab | Form shows "Create Account", password hint |
| Password toggle | Click eye icon | Password field type toggles `password`↔`text` |
| Close via × button | Click × | Modal closes |
| Close via overlay | Click outside modal | Modal closes |
| HTML5 validation | Submit with empty fields | Browser prevents submission |
| Invalid credentials | Submit wrong credentials | Error: "Invalid email or password" |
| Modal centering | Open modal | Modal centered, not overlapping navbar |
| Escape to close | Press Escape | Modal closes |
| Focus trap | Press Tab repeatedly | Focus cycles within modal only |
| Focus return | Close modal | Focus returns to Sign In button |
| Network error | Submit with backend down | Error: "Something went wrong..." |
| Dark mode contrast | Toggle dark mode, open modal | Modal visible, text readable |

---

## Contract 3: Homepage Content

**File**: `website/e2e/homepage.spec.ts`  
**Validates**: FR-008, SC-003  
**Precondition**: Docusaurus production build served at `baseURL`

| Test | Input | Expected Output |
|------|-------|-----------------|
| Hero section | Navigate to `/` | Badge "Interactive AI Textbook", heading, CTA links present |
| Feature cards | Scroll to features | 6 cards with correct titles |
| Stats section | Scroll to stats | "12+ Chapters", "6 Modules", "AI-Powered Study Companion" |

---

## Contract 4: Docs Navigation

**File**: `website/e2e/docs-navigation.spec.ts`  
**Validates**: FR-009 through FR-011, SC-004  
**Precondition**: Docusaurus production build served at `baseURL`

| Test | Input | Expected Output |
|------|-------|-----------------|
| Intro page renders | Navigate to `/docs/intro` | Sidebar, breadcrumbs, TOC present |
| Dark mode toggle | Click theme toggle | Theme switches |
| Next navigation | Click "Next" on Chapter 1 | Navigates to Chapter 2 |
| Start Reading CTA | Click "Start Reading" on homepage | Navigates to `/docs/intro` |

---

## Contract 5: Chatbot Interaction

**File**: `website/e2e/chatbot.spec.ts`  
**Validates**: FR-012  
**Precondition**: Docusaurus production build served at `baseURL`, docs page loaded

| Test | Input | Expected Output |
|------|-------|-----------------|
| Open chatbot | Click "Open chatbot" on docs page | Dialog opens with welcome message, input area |
| Close chatbot | Click close button | Dialog closes |
