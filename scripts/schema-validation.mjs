// Local schema vocabulary only; not a general JSON Schema implementation or policy engine.
// Unsupported keywords fail during compilation, including in branches not exercised.
import { isDeepStrictEqual } from "node:util";

const annotations = new Set(["$schema", "$id", "title", "description"]);
const keywords = new Set([...annotations, "type", "enum", "const", "properties", "required",
  "additionalProperties", "items", "minItems", "minLength", "pattern", "minimum",
  "exclusiveMinimum", "format", "allOf", "anyOf", "if", "then"]);
const types = {
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
  array: Array.isArray,
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  integer: (v) => Number.isInteger(v),
};

// Restricted RFC3339 profile: explicit timezone, real calendar date, no leap seconds.
// The schema checker cannot verify freshness or that a timestamp describes a real action.
function dateTime(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!m) return false;
  const [, y, mo, d, h, mi, s, , oh = "0", om = "0"] = m;
  const year = Number(y), month = Number(mo), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && Number(h) < 24 && Number(mi) < 60 && Number(s) < 60
    && Number(oh) < 24 && Number(om) < 60;
}

export function compileSchema(schema, schemaPath = "$schema") {
  if (typeof schema === "boolean") return (value, path = "$") => schema ? [] : [`${path}: forbidden`];
  const bad = (message) => { throw new Error(`${schemaPath}: ${message}`); };
  if (!types.object(schema)) bad("schema must be an object or boolean");
  for (const key of Object.keys(schema)) if (!keywords.has(key)) bad(`unsupported keyword ${key}`);
  for (const key of annotations) if (key in schema && typeof schema[key] !== "string") bad(`${key} must be a string`);
  if ("$schema" in schema && schema.$schema !== "https://json-schema.org/draft/2020-12/schema") bad("unsupported dialect");
  if ("type" in schema && (typeof schema.type !== "string" || !Object.hasOwn(types, schema.type))) bad("unsupported type");
  if ("enum" in schema && (!Array.isArray(schema.enum) || !schema.enum.length)) bad("enum must be a nonempty array");
  if ("required" in schema && (!Array.isArray(schema.required) || schema.required.some((k) => typeof k !== "string")
    || new Set(schema.required).size !== schema.required.length)) bad("required must contain unique property names");
  for (const key of ["minimum", "exclusiveMinimum"]) if (key in schema && !types.number(schema[key])) bad(`${key} must be finite`);
  for (const key of ["minItems", "minLength"]) if (key in schema && (!Number.isInteger(schema[key]) || schema[key] < 0)) bad(`${key} must be a nonnegative integer`);
  if ("format" in schema && schema.format !== "date-time") bad(`unsupported format ${schema.format}`);
  let pattern;
  if ("pattern" in schema) {
    if (typeof schema.pattern !== "string") bad("pattern must be a string");
    try { pattern = new RegExp(schema.pattern, "u"); } catch { bad("invalid pattern"); }
  }
  if ("properties" in schema && !types.object(schema.properties)) bad("properties must be an object");
  const properties = new Map(Object.entries(schema.properties ?? {}).map(([k, s]) => [k, compileSchema(s, `${schemaPath}.properties.${k}`)]));
  const nested = (key) => Object.hasOwn(schema, key) ? compileSchema(schema[key], `${schemaPath}.${key}`) : null;
  const items = nested("items"), additional = nested("additionalProperties");
  const condition = nested("if"), then = nested("then");
  const branches = (key) => {
    if (!(key in schema)) return [];
    if (!Array.isArray(schema[key]) || !schema[key].length) bad(`${key} must be a nonempty array`);
    return schema[key].map((s, i) => compileSchema(s, `${schemaPath}.${key}[${i}]`));
  };
  const all = branches("allOf"), any = branches("anyOf");

  return (value, path = "$") => {
    const errors = [];
    const fail = (message) => errors.push(`${path}: ${message}`);
    if (schema.type && !types[schema.type](value)) fail(`expected ${schema.type}`);
    if ("const" in schema && !isDeepStrictEqual(value, schema.const)) fail("does not match const");
    if (schema.enum && !schema.enum.some((v) => isDeepStrictEqual(value, v))) fail("not in enum");
    if (types.string(value)) {
      if (schema.minLength !== undefined && [...value].length < schema.minLength) fail("too short");
      if (pattern && !pattern.test(value)) fail("does not match pattern");
      if (schema.format === "date-time" && !dateTime(value)) fail("expected supported RFC3339 date-time");
    }
    if (types.number(value)) {
      if (schema.minimum !== undefined && value < schema.minimum) fail("below minimum");
      if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) fail("at or below exclusiveMinimum");
    }
    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) fail("too few items");
      if (items) value.forEach((v, i) => errors.push(...items(v, `${path}[${i}]`)));
    }
    if (types.object(value)) {
      for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail(`missing required '${key}'`);
      for (const [key, v] of Object.entries(value)) {
        const check = properties.get(key) ?? additional;
        if (check) errors.push(...check(v, `${path}.${key}`));
      }
    }
    for (const check of all) errors.push(...check(value, path));
    if (any.length && !any.some((check) => check(value, path).length === 0)) fail("no anyOf branch matched");
    if (condition) {
      const check = condition(value, path).length === 0 ? then : null;
      if (check) errors.push(...check(value, path));
    }
    return errors;
  };
}
