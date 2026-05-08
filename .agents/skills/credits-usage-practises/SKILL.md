---
name: credits-usage-practises
alwaysApply: true
description: >
  This skill defines how an AI coding agent must design, validate, calculate, and persist financial usage records involving:
- credit consumption
- provider costs (USD base)
- FX conversion (USD → EUR)
- application fees
- gross billing amounts

The goal is consistency, auditability, and type safety across all systems.
---

# SKILL: Financial Usage Records (Credits, Charges, FX, Fees)

## Core Principles

### 1. Single Source of Truth

- provider_charge_usd is ALWAYS the base monetary value.
- All other monetary values must derive from it.
- Do NOT duplicate financial fields in multiple places (e.g. metadata).

---

### 2. Strict Typing

- All monetary values MUST be stored as Decimal (Prisma) / numeric (PostgreSQL).
- NEVER store numbers as strings.

---

### 3. Explicit Currency Naming

Every monetary field must include currency in the name:

- provider_charge_usd
- provider_charge_eur
- app_fee_amount_eur
- gross_charge_amount_eur

Never use ambiguous names like:

- amount
- charge
- provider_charge_amount

---

### 4. Deterministic Calculations

provider_charge_usd
↓ (fx_rate_usd_to_eur)
provider_charge_eur
↓ (app_fee_multiplier)
app_fee_amount_eur
↓ (+)
gross_charge_amount_eur

---

### 5. Formula Definitions

provider_charge_eur = provider_charge_usd \* fx_rate_usd_to_eur

app_fee_amount_eur = provider_charge_eur \* app_fee_multiplier

gross_charge_amount_eur = provider_charge_eur + app_fee_amount_eur

Note: app_fee_multiplier = 4 means 4x (NOT 4%)

---

### 6. Rounding Rules

- Store values with 4 decimal precision
- Display with 2 decimals
- Always round after each calculation step

---

### 7. FX Requirements

If provider_charge_eur exists, the following MUST exist:

- fx_rate_usd_to_eur
- fx_source
- fx_timestamp

---

### 8. Nullability Rules

- provider_charge_usd: NOT NULL
- provider_charge_eur: NOT NULL
- app_fee_amount_eur: NOT NULL
- gross_charge_amount_eur: NOT NULL
- fx_rate_usd_to_eur: NOT NULL

Derived fields must NEVER be null.

---

### 9. Metadata Separation

metadata is ONLY for:

- provider raw responses
- non-critical info

Never store:

- charges
- fees
- FX values

---

### 10. Idempotency

- idempotency_key is REQUIRED
- must be UNIQUE
- prevents duplicate billing

---

## Prisma Schema (Reference)

model usage_records {
id Int @id @default(autoincrement())
uuid String @unique @db.Uuid
user_uuid String @db.Uuid

type usage_type
project_type project_type
source String

delta_credits Int
balance_after Int

source_ref_uuid String? @db.Uuid
idempotency_key String @unique

provider_charge_usd Decimal @db.Decimal(12, 4)
provider_charge_eur Decimal @db.Decimal(12, 4)

fx_rate_usd_to_eur Decimal @db.Decimal(12, 6)
fx_source String
fx_timestamp DateTime

app_fee_multiplier Decimal @db.Decimal(6, 3)
app_fee_amount_eur Decimal @db.Decimal(12, 4)
gross_charge_amount_eur Decimal @db.Decimal(12, 4)

provider String
provider_task_id String?
generation_model String?
generation_asset_type String?
workflow_source String?

provider_credits_used Int?
fixed_credits_deduction Int?

metadata Json?

created_at DateTime @default(now())
updated_at DateTime @updatedAt
}

---

## Validation Checklist

- No numeric fields are strings
- All monetary fields include currency suffix
- No duplicated financial fields
- provider_charge_usd is present
- FX fields exist if EUR is used
- app_fee_multiplier is used (not percentage)
- Derived values are correct
- No derived fields are null
- metadata contains no financial values
- idempotency_key is unique

---

## Anti-Patterns (Forbidden)

- Storing money as strings
- Ambiguous field names
- Mixing currencies without labels
- Duplicating computed values
- Leaving calculable fields null
- Mixing percentage and multiplier
- Storing financial data in metadata

---

## Summary

This system ensures:

- deterministic financial calculations
- explicit currency handling
- strict typing
- audit-safe storage
