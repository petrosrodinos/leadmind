# AI-Powered Lead Generation, Enrichment & Outreach Platform

## 1. Overview

Full-stack AI system for discovering, enriching, scoring, and contacting leads with built-in CRM features.

---

## 2. Core Flow

Lead Sources → Filters → Scraping → Processing → AI → CRM → Outreach

---

## 3. Lead Sources

- Apify LinkedIn search
- Apify generic lead finder
- Google search scraping
- Government business records
- Custom scraping sources

Each source supports different filters.

---

## 4. Filters System

Filters control how leads are discovered and processed.

### Structure

- name
- sourceType (linkedin, google, gov, apify)
- queryConfig
- enabled (true/false)
- cronSchedule
- channel (email, sms, phone_call)
- aiInstructions (custom prompt)

### Channels

- Email
- SMS
- Phone Call

### AI Instructions Examples

- Generate cold email
- Generate SMS outreach
- Generate phone call script
- Suggest 3 business ideas

---

## 5. Data Storage

### Raw Leads

Store all scraped leads for logging.

### Leads Table

Global shared leads pool.

### Contacts (CRM)

Users can convert leads into contacts.

---

## 6. AI Pipeline

### 1. Scoring

Score 1–10 based on relevance.

### 2. Enrichment

Scrape website and summarize.

### 3. Idea Generation

Suggest 2–3 business opportunities.

### 4. Message Generation

Generate personalized messages based on:

- channel
- instructions
- lead data

---

## 7. Outreach

### Channels

- Email (Resend)
- SMS (Twilio)
- Phone Calls

### Notifications

Store all sent messages.

### Sequences

Support follow-ups with delays.

---

## 8. CRM Features

- contact management
- status tracking
- notes
- tags
- interaction history

Status Flow:
New → Qualified → Contacted → Replied → Closed

---

## 9. Search

Use Elasticsearch for filtering and fast queries.

---

## 10. UI

Table-based interface with:

- lead data
- score
- ideas
- messages
- status

Actions:

- edit
- send
- regenerate
- add to contacts

---

## 11. Tech Stack

- NestJS
- PostgreSQL + Prisma
- Redis + BullMQ
- Elasticsearch
- Apify
- Vercel AI SDK
- Resend
- Twilio

---

## 12. Key Principles

- async processing
- cost control for AI
- modular architecture
- extensibility

---

## 13. Summary

AI-powered system that:

- finds leads
- evaluates them
- generates outreach
- manages relationships
