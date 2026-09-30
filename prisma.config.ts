// @ts-ignore - Ignore module not found since this is a Prisma internal config
import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  orm: {
    adapter: "prisma",
    family: "sqlite",
    target: "prisma/schema.prisma"
  },
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
