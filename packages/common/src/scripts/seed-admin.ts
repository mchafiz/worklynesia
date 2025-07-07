// scripts/seed-admin.ts

import { seedAdmin } from "../database/seed/admin.seed";

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
