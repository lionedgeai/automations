# Automations Hub

Multi-purpose repository for automation projects, demos, and customer-specific implementations.

## Repository Structure

```
automations/
├── demos/           # Demo projects and examples
├── customers/       # Customer-specific automation work
│   └── nvision/
│       └── poc/     # nVision n8n POC
├── common/          # Shared utilities, libraries, and helpers
├── .squad/          # Team state and agent coordination
├── .github/         # GitHub Actions and workflows
└── README.md        # This file
```

## Projects

### nVision n8n POC

Self-hosted n8n workflow automation platform with custom UI for triggering workflows via API.

**Location:** [`customers/nvision/poc/`](customers/nvision/poc/)

**Quick Start:**
```bash
cd customers/nvision/poc
# Follow the README.md in that directory
```

See the [full POC documentation](customers/nvision/poc/README.md) for setup instructions, API integration, and testing.

## Directory Guide

- **`demos/`** - Standalone demo projects showcasing automation capabilities
- **`customers/`** - Customer-specific projects organized by customer name
- **`common/`** - Reusable code, utilities, and libraries shared across projects

## Contributing

When adding new projects:

1. **Demo projects** → Place in `demos/[project-name]/`
2. **Customer work** → Place in `customers/[customer-name]/[project-name]/`
3. **Shared code** → Place in `common/[module-name]/`

Each project directory should contain its own `README.md` with setup and usage instructions.
