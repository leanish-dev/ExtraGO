# EXTRAGO — AGENT_START_HERE.md
# UNIVERSAL EXECUTION PROTOCOL
Version: Living Document
Status: Mandatory
Applies to: ALL AGENTS

---

# PURPOSE

This document is the mandatory execution protocol for every AI agent working on the extraGO project.

Its objective is to ensure that no implementation, refactor, correction or analysis is performed without first validating the current state of the platform.

The implementation is always the operational source of truth.

Documentation is guidance.

Old audits are historical records.

Never assume any information remains valid without verification.

---

# PROJECT IDENTITY

extraGO = A Infraestrutura de Mão de Obra do Brasil.

extraGO is NOT:

- a job board
- a vacancy portal
- a marketplace
- a gig platform
- a generic SaaS dashboard
- a fintech dashboard

Always preserve the official positioning.

---

# GOLDEN RULES

Before writing a single line of code:

DO NOT ASSUME.

VERIFY.

TRACE.

CONFIRM.

Only after confirmation may implementation begin.

---

# MANDATORY DOCUMENTATION REVIEW

Always review before starting:

- AGENT_START_HERE.md
- MASTER_CONTEXT.md
- BUSINESS_MODEL.md
- PRODUCT_ARCHITECTURE.md
- VISUAL_GUIDELINES.md
- TEST_DATA_POLICY.md
- ROADMAP.md

If documentation conflicts with implementation:

DO NOT silently fix.

Document the conflict.

---

# IMPLEMENTATION IS THE SOURCE OF TRUTH

Priority order:

1. Current implementation
2. Database schema
3. Backend logic
4. API contracts
5. Documentation
6. Historical audits

Never invert this order.

---

# PRE-EXECUTION CHECKLIST

Before every task:

□ Read mandatory documentation

□ Verify project structure

□ Verify build status

□ Verify typecheck status

□ Verify migrations

□ Verify database schema

□ Verify enums

□ Verify authentication

□ Verify authorization

□ Verify routes

□ Verify integrations

□ Verify environment variables (names only)

□ Verify seeds

□ Verify mocks

□ Verify hardcoded values

□ Verify TODO/FIXME

No implementation may begin before completing this checklist.

---

# NEVER TRUST PREVIOUS AUDITS BLINDLY

Every previous audit must be considered historical.

Before accepting any statement from an old report:

Confirm it directly in the current codebase.

Classify every finding as:

✅ Confirmed

⚠️ Partially confirmed

❌ No longer true

🚧 Changed

❓ Requires investigation

Never propagate outdated information.

---

# CRITICAL ITEMS THAT MUST ALWAYS BE REVALIDATED

Always verify again:

## Product

□ Landing

□ Minha Carreira

□ Perfil

□ Empresas

□ Extras

□ Carteira

□ Financeiro

□ Feed

□ Chat

□ Notificações

□ Analytics

□ Governança

□ Admin

□ Representantes

---

## Authentication

□ Sessions

□ JWT

□ Cookies

□ OAuth

□ Role Guards

□ Middleware

---

## Authorization

□ Roles

□ Admin

□ CEO

□ Governance

□ Representative

□ Enterprise

□ Professional

Never assume permissions.

Trace middleware.

Trace routes.

Trace frontend guards.

---

## Database

Verify:

□ ORM

□ Query Builder

□ Database engine

□ Schemas

□ Tables

□ Relations

□ Foreign Keys

□ Primary Keys

□ Indexes

□ Constraints

□ Cascades

□ Enums

□ Defaults

□ Seeds

□ Migrations

---

## Financial System

Never assume financial rules.

Verify:

□ Split Engine

□ Wallet

□ Wallet Ledger

□ Escrow

□ Payments

□ Withdrawals

□ Fees

□ Commission

□ Referral

□ Subscriptions

□ Gateway

□ Webhooks

□ Audit Trail

---

## Career

Verify:

□ Level

□ Experience

□ Reputation

□ Achievements

□ Timeline

□ Missions

□ Progress

□ Goals

Trace calculations.

Never trust labels.

Always verify storage and business logic.

---

## Referral System

Verify:

□ Referral links

□ Tracking

□ Attribution

□ Commission

□ Wallet

□ Fraud prevention

□ Self referral

□ Cycles

□ Duplicate prevention

---

# VERIFY FRONTEND + BACKEND + DATABASE

Nothing is considered implemented until confirmed across:

Frontend

↓

API

↓

Business Logic

↓

Database

If one layer is missing:

Mark as partially implemented.

---

# VERIFY BUILD STATUS

Always report:

Typecheck

Build

Lint

Tests

Migration compatibility

Never claim "project working" without validation.

---

# VERIFY SEEDS

Classify every seed:

□ Production

□ Development

□ Test

□ Demo

□ Mock

□ Bootstrap

□ Fixture

Confirm:

Runs automatically?

Creates users?

Creates companies?

Creates financial data?

Creates governance accounts?

Uses upsert?

Idempotent?

---

# GOVERNANCE ACCOUNTS

These accounts must never receive fake data:

- leonardoscheffel2000@gmail.com
- extrago.ceo@yahoo.com
- jeandick2000@gmail.com

Only approved testing accounts:

- teste.f@extrago.com
- teste.e@extrago.com

---

# VERIFY MOCKS

Search entire repository for:

mock

fake

sample

fixture

faker

dummy

placeholder

Math.random

hardcoded

fallback

demo

testData

Every occurrence must be classified:

MOCK

HARDCODED

FALLBACK

REAL DATA

UNKNOWN

---

# VERIFY DOCUMENTATION

Documentation may be outdated.

Always compare:

Documentation

↓

Implementation

↓

Database

↓

Runtime behavior

Document every contradiction.

---

# BEFORE IMPLEMENTING

Generate an execution plan containing:

Objective

Files affected

Dependencies

Risks

Architecture impact

Business impact

Rollback strategy

Validation plan

Do not skip planning.

---

# AFTER IMPLEMENTATION

Always validate:

Typecheck

Build

Database

Permissions

API

Frontend

Business Rules

No silent failures.

---

# REQUIRED FINAL REPORT

Every task must end with:

1. What was analyzed

2. Files modified

3. Files created

4. Architecture impact

5. Business impact

6. Validation performed

7. Typecheck status

8. Build status

9. Remaining risks

10. Recommended next steps

If no files were changed:

Files modified: None

Files created: None

Architecture impact: None

---

# PERMANENT AUDIT CHECKLIST

## Architecture

□ Current

□ Consistent

□ Documented

---

## Database

□ Verified

□ Consistent

□ Migration compatible

---

## API

□ Connected

□ Typed

□ Documented

---

## Frontend

□ Connected

□ Responsive

□ Accessible

---

## Security

□ Authentication

□ Authorization

□ Sessions

□ Secrets

□ Uploads

□ Rate Limit

□ CORS

□ Validation

---

## Product

□ Landing

□ Minha Carreira

□ Perfil

□ Empresas

□ Extras

□ Carteira

□ Feed

□ Chat

□ Financeiro

□ Analytics

---

## Quality

□ Build

□ Typecheck

□ Lint

□ Tests

□ Dead Code

□ TODO

□ FIXME

□ Console.log

□ any

□ ts-ignore

---

# LIVING RECOVERY PLAN

Maintain a continuously updated recovery backlog.

Every issue must include:

Priority

Severity

Affected modules

Business impact

Technical impact

Dependencies

Current status

Validation required

Mark only after complete verification.

Status options:

NOT STARTED

IN PROGRESS

BLOCKED

READY FOR VALIDATION

VALIDATED

COMPLETED

---

# SEVERITY SCALE

Critical

High

Medium

Low

Informational

---

# EVIDENCE POLICY

Every important statement must be backed by evidence.

Acceptable evidence:

- Source code
- Database schema
- Migration
- Runtime validation
- API contract
- Build output
- Typecheck output

Never use screenshots as primary evidence.

---

# ABSOLUTE PROHIBITIONS

Never invent:

- Features
- Business rules
- Financial rules
- Metrics
- Percentages
- Permissions
- Database relations
- API behavior
- User flows

Never state "implemented" without tracing:

Frontend

↓

Backend

↓

Database

---

# FINAL PRINCIPLE

When in doubt:

Stop.

Investigate.

Trace.

Confirm.

Only then proceed.

The quality of extraGO depends on verified implementation, not assumptions.
