import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  created_at: string;
};

function Index() {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({ name: "", category: "", price: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const res = await fetch(`/api/products?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) setError(json.error || "Failed to load");
    else {
      setItems(json.data);
      setTotal(json.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Create failed");
      return;
    }
    setForm({ name: "", category: "", price: "", description: "" });
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Delete failed");
      return;
    }
    load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog API</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live demo of the REST API. Endpoints:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">GET/POST /api/products</code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">PUT/DELETE /api/products/:id</code>.
          </p>
        </header>

        <section className="mb-8 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold">Create product</h2>
          <form onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="sm:col-span-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add product
            </button>
          </form>
        </section>

        <section className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Search by name</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Filter by category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={load}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
          >
            Apply
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {loading ? "Loading…" : `${total} total`}
          </span>
        </section>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No products yet — add one above.
                  </td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{p.category}</td>
                  <td className="px-3 py-2">${Number(p.price).toFixed(2)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.description}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
