# Data Model: Fix Duplicate Button Rendering

**Feature**: 016-fix-duplicate-buttons  
**Date**: 2026-03-11

## Summary

No data model changes required. This is a frontend-only UI bug fix that removes duplicate buttons from three React components. No database tables, API schemas, or entity models are affected.

## Entities

No new entities. No entity modifications.

## State Changes

The only state affected is React component-level UI state, already managed by `LayoutWrapper`:

| State Variable | Owner | Change |
|---------------|-------|--------|
| `isOpen` (chatbot) | `ChatbotWidget` | No change — now also controls floating toggle visibility |
| `isPersonalizedActive` | `LayoutWrapper` | No change |
| `isUrduActive` | `LayoutWrapper` | No change |

## Props Removed

| Component | Prop Removed | Reason |
|-----------|-------------|--------|
| `PersonalizedContent` | `onShowOriginal` | Button that used this callback is removed; trigger button handles it |
| `UrduContent` | `onShowEnglish` | Button that used this callback is removed; trigger button handles it |
