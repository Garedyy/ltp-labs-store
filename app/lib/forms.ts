import type { ErrorCode } from "./error-codes";

export type FieldErrors<Name extends string> = Partial<Record<Name, ErrorCode>>;

export type FieldValues<Name extends string> = Record<Name, string>;

// Shape of every demo form refusal: the codes per field and the typed values, re-rendered as is.
export type FormFailure<Name extends string> = {
  ok: false;
  errors: FieldErrors<Name>;
  values: FieldValues<Name>;
};

export function readFields<Name extends string>(
  form: FormData,
  names: readonly Name[],
): FieldValues<Name> {
  const values = {} as FieldValues<Name>;
  for (const name of names) values[name] = String(form.get(name) ?? "").trim();
  return values;
}

export function hasErrors(errors: FieldErrors<string>): boolean {
  return Object.values(errors).some(Boolean);
}

// The field that receives focus on a refused submission, in document order.
export function firstInvalid<Name extends string>(
  names: readonly Name[],
  errors: FieldErrors<Name>,
): Name | undefined {
  return names.find((name) => errors[name]);
}

export type FieldProps<Name extends string> = {
  name: Name;
  error?: ErrorCode;
  defaultValue?: string;
  autoFocus: boolean;
};

// Per-field props of a form re-rendered after a refusal: code, typed value, focus on the first
// invalid one (autoFocus for the no-JS document).
export function fieldProps<Name extends string>(
  names: readonly Name[],
  result?: FormFailure<Name>,
): Record<Name, FieldProps<Name>> {
  const first = result ? firstInvalid(names, result.errors) : undefined;
  const props = {} as Record<Name, FieldProps<Name>>;
  for (const name of names) {
    props[name] = {
      name,
      error: result?.errors[name],
      defaultValue: result?.values[name],
      autoFocus: first === name,
    };
  }
  return props;
}
