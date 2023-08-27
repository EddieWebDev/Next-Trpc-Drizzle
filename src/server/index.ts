import { drizzle } from "drizzle-orm/planetscale-serverless";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { connect } from "@planetscale/database";
import { config } from "../app/db/config";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { todos } from "../../drizzle/schema";

const conn = connect(config);
const db = drizzle(conn);

/* migrate(db, { migrationsFolder: "drizzle" }); */

export const appRouter = router({
  getTodos: publicProcedure.query(async () => {
    return await db.select().from(todos);
  }),
  addTodo: publicProcedure.input(z.string()).mutation(async (options) => {
    await db.insert(todos).values({ content: options.input, done: 0 });
    return true;
  }),
  setDone: publicProcedure
    .input(z.object({ id: z.number(), done: z.number() }))
    .mutation(async (options) => {
      await db
        .update(todos)
        .set({ done: options.input.done })
        .where(eq(todos.id, options.input.id));
      return true;
    }),
});

export type AppRouter = typeof appRouter;
