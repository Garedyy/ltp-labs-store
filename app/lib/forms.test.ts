import { describe, expect, it } from "vitest";

import { fieldProps, firstInvalid, hasErrors, readFields } from "./forms";

const FIELDS = ["name", "email"] as const;

describe("readFields", () => {
  it("reads and trims every named field, missing ones as empty strings", () => {
    const form = new FormData();
    form.set("name", "  Ana ");
    expect(readFields(form, FIELDS)).toEqual({ name: "Ana", email: "" });
  });

  it("caps every field at 200 characters unless a caller raises the limit", () => {
    const form = new FormData();
    form.set("name", "a".repeat(250));
    form.set("email", "b".repeat(250));
    const values = readFields(form, FIELDS, { email: 220 });
    expect(values.name).toHaveLength(200);
    expect(values.email).toHaveLength(220);
  });
});

describe("firstInvalid and hasErrors", () => {
  it("follows the document order and ignores undefined codes", () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: undefined })).toBe(false);
    expect(firstInvalid(FIELDS, { email: "email-invalid" })).toBe("email");
    expect(firstInvalid(FIELDS, { email: "email-invalid", name: "field-required" })).toBe("name");
  });
});

describe("fieldProps", () => {
  it("returns neutral props without a result", () => {
    expect(fieldProps(FIELDS).name).toEqual({
      name: "name",
      error: undefined,
      defaultValue: undefined,
      autoFocus: false,
    });
  });

  it("marks the first invalid field for focus and echoes the typed values", () => {
    const props = fieldProps(FIELDS, {
      ok: false,
      errors: { email: "email-invalid" },
      values: { name: "Ana", email: "nope" },
    });
    expect(props.name).toEqual({
      name: "name",
      error: undefined,
      defaultValue: "Ana",
      autoFocus: false,
    });
    expect(props.email).toEqual({
      name: "email",
      error: "email-invalid",
      defaultValue: "nope",
      autoFocus: true,
    });
  });
});
