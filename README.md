# OntoChimpWebApp (ontochimpwebapp)

## Introduction

OntoChimpWebapp is the term and repository for the frontend component of the OntoChimp Ontology Development system. This system will allow the ontology developer to submit reference documents for a selected domain, and pass these documents to up to three different Large Language Models, currently OpenAI GPT, Google Gemini, and Antropic Claude. 
The initial implementation of the system will allow processing of a single document at a time, whereas the planned ehnancement to the system will allow the creation of an Ontology Research Workspace that supports serious, longer term ontology development projects with multiple sets of multiple documents. 



## Install the dependencies

```bash
pnpm install
# or: yarn/npm/bun install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Format & Lint the files

```bash
pnpm run lint
# or: yarn/npm/bun run lint
```

...or just check formatting & linting:

```bash
pnpm run lint:check
# or: yarn/npm/bun run lint:check
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).
