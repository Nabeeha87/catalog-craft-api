import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  price: z.number().finite().min(0),
  description: z.string().max(2000).optional().default(""),
});

export const Route = createFileRoute("/api/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get("search")?.trim() ?? "";
        const category = url.searchParams.get("category")?.trim() ?? "";
        const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10) || 1, 1);
        const limit = Math.min(
          Math.max(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 1),
          100,
        );
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let q = supabaseAdmin
          .from("products")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (category) q = q.eq("category", category);
        if (search) q = q.ilike("name", `%${search}%`);

        const { data, error, count } = await q;
        if (error) return json({ error: error.message }, 500);

        const total = count ?? 0;
        return json({
          data: data ?? [],
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 0,
        });
      },

      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
          return json(
            { error: "Validation failed", details: parsed.error.issues },
            400,
          );
        }
        const { data, error } = await supabaseAdmin
          .from("products")
          .insert(parsed.data)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json(data, 201);
      },
    },
  },
});
