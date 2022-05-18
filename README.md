# birthday-bot

## About

DTI Slack Birthday Bot (nicknamed Halpert) sends birthday celebration messages
for team members when the special day comes!

This functionality already exists in some Slack apps. However, enterprise rates
for existing solutions are quite high, and DTI is pretty big. Halpert aims to be
a simple self-hosted alternative that doesn't cost as much.

## Features

Currently supports:

- Collecting birthday information through a Slack modal
- Sending birthday messages to a configurable channel
- Sending welcome message to new Slack users

Roadmap:

- Sending birthday reminders to others (ex: 1 week before)
- Supporting multiple teams and birthday message channels
- Calendar integration
- Ability to opt out of celebrations
- Filterable upcoming birthday list/table view

## Setup

### Install

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Run locally
yarn dev

# Build and run for production
yarn start

# Lint/format/typecheck
yarn lint:check
yarn format:check
yarn typecheck
```

## Contributors

- @Enochen - Created in 2022
