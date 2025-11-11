# Common Commands

## Polar

### Archive all customers

```zsh
tsx scripts/archive-all-products.ts
```

### Get all products

```zsh
tsx scripts/get-all-products.ts
```

### Delete all customers

```zsh
tsx scripts/delete-all-customers.ts
```

## Railway

### Reset remote database

```zsh
DATABASE_URL="postgresql://postgres:<YOUR_DB_PASSWORD>@maglev.proxy.rlwy.net:<SOME_PORT_NUMBER>/railway" npx prisma migrate reset --force
```

### Seed remote database

```zsh
DATABASE_URL="postgresql://postgres:<YOUR_DB_PASSWORD>@maglev.proxy.rlwy.net:<SOME_PORT_NUMBER>/railway" npx prisma db seed
```
