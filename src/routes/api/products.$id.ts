import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const uuid = z.string().uuid();

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    price: z.number().finite().min(0).optional(),
    description: z.string().max(2000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required",
  });

export const Route = createFileRoute("/api/products/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        if (!uuid.safeParse(params.id).success) {
          return json({ error: "Invalid product id" }, 400);
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
          return json(
            { error: "Validation failed", details: parsed.error.issues },
            400,
          );
        }
        const { data, error } = await supabaseAdmin
          .from("products")
          .update(parsed.data)
          .eq("id", params.id)
          .select()
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Product not found" }, 404);
        return json(data);
      },

      DELETE: async ({ params }) => {
        if (!uuid.safeParse(params.id).success) {
          return json({ error: "Invalid product id" }, 400);
        }
        const { data, error } = await supabaseAdmin
          .from("products")
          .delete()
          .eq("id", params.id)
          .select()
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Product not found" }, 404);
        return json({ deleted: true, product: data });
      },
    },
  },
});
