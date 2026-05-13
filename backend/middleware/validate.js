function validateProductBody(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("name")) {
    if (typeof body.name !== "string" || body.name.trim() === "") {
      errors.push("name must be a non-empty string");
    } else {
      out.name = body.name.trim();
    }
  }

  if (!partial || has("category")) {
    if (typeof body.category !== "string" || body.category.trim() === "") {
      errors.push("category must be a non-empty string");
    } else {
      out.category = body.category.trim();
    }
  }

  if (!partial || has("price")) {
    const n = Number(body.price);
    if (!Number.isFinite(n) || n < 0) {
      errors.push("price must be a number >= 0");
    } else {
      out.price = n;
    }
  }

  if (has("description")) {
    if (typeof body.description !== "string") {
      errors.push("description must be a string");
    } else {
      out.description = body.description.trim();
    }
  }

  return { errors, value: out };
}

module.exports = { validateProductBody };