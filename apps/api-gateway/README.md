# Worklynesia API Gateway

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" /></a>
</p>

## Description

API Gateway for Worklynesia - A web-based attendance system. This service acts as the single entry point for all client requests, handling routing, authentication, and request/response transformation.

## Features

- 🔐 Authentication & Authorization
- ⚡ Attendance Api for check-in, check-out, and attendance history
- 📡 User Api for user management

## Prerequisites

- Node.js
- pnpm

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: `http://localhost:3000/api/docs`

## Available Scripts

```bash
# Lint code
$ pnpm run start:dev
$ pnpm run build
```

## Project Structure

```
src/
    ├── attendance/         # Attendance service routes
    ├── auth/               # Authentication routes
    └── users/              # User management routes
    ├── shared/             # Shared modules (kafka)

```
