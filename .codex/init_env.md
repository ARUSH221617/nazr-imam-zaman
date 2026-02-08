# Environment setup notes

## Remove lock file
The Prisma migration lock was removed to unblock environment setup. If needed again, delete it before running commands:

```bash
rm prisma/migrations/migration_lock.toml
```

## Install dependencies

```bash
bun install
```

## Run the dev server
The repo's `bun run dev` script pipes output through `tee` and fails when `--hostname` is passed. Use `bunx` directly to start the server with a host/port:

```bash
bunx next dev -p 3000 --hostname 0.0.0.0
```
