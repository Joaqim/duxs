export function singularOf(word: string): string {
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ses")) return word.slice(0, -2);
  return word.endsWith("s") ? word.slice(0, -1) : word;
}

export function pascal(segment: string): string {
  return segment
    .split(/(?=[A-Z])/)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function paramRestatement(
  param: string,
  parentSingular: string,
): string | null {
  const lowerParam = param.toLowerCase();
  const lowerParent = parentSingular.toLowerCase();
  if (lowerParam.endsWith(`${lowerParent}id`)) {
    return param.slice(0, param.length - parentSingular.length - 2);
  }
  if (lowerParam.startsWith(lowerParent)) {
    const tail = param.slice(parentSingular.length);
    if (tail.toLowerCase().endsWith("id") && tail.length >= 2) return tail;
  }
  return null;
}

export function toMethodName(method: string, path: string): string {
  const verb = method.toLowerCase();
  const segments = path
    .replace(/^\/api\/v\d+\//, "")
    .split("/")
    .filter(Boolean);
  const words: string[] = [];
  let lastLiteral: string | null = null;
  segments.forEach((segment, i) => {
    if (!segment.startsWith("{")) {
      words.push(segment);
      lastLiteral = segment;
      return;
    }
    const terminal = i === segments.length - 1;
    const param = segment.slice(1, -1);
    const parentSingular =
      lastLiteral === null ? null : singularOf(lastLiteral);
    const rest =
      parentSingular === null ? null : paramRestatement(param, parentSingular);
    if (rest === null) {
      if (words.length > 0) {
        words[words.length - 1] = singularOf(words[words.length - 1]);
      }
      words.push("By", pascal(param));
      return;
    }
    // Absorbed: the parent word already names the resource.
    if (!terminal) return;
    if (words.length > 0) {
      words[words.length - 1] = singularOf(words[words.length - 1]);
    }
    words.push("By", pascal(rest.length > 0 ? rest : "Id"));
  });
  return verb + words.map(pascal).join("");
}

export function toResponseAliasName(methodName: string): string {
  return `${methodName[0].toUpperCase()}${methodName.slice(1)}Response`;
}

export function operationIdFallbackName(operationId: string): string {
  const stripped = operationId.replace(/^[A-Za-z]+_/, "");
  return stripped[0].toLowerCase() + stripped.slice(1);
}

export interface NameableOperation {
  method: string;
  path: string;
  operationId: string;
}

/** Key convention for resolveCollisions' returned Map. */
export function operationKey(method: string, path: string): string {
  return `${method} ${path}`;
}

/**
 * Resolves the final method name for each operation, keyed by
 * {@link operationKey}. Operations deriving colliding names fall back to
 * their operationId-derived name.
 */
export function resolveCollisions(
  ops: NameableOperation[],
): Map<string, string> {
  const byKey = new Map<string, string>();
  for (const op of ops) {
    byKey.set(
      operationKey(op.method, op.path),
      toMethodName(op.method, op.path),
    );
  }
  const counts = new Map<string, number>();
  for (const name of byKey.values()) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  for (const op of ops) {
    const key = operationKey(op.method, op.path);
    const name = byKey.get(key)!;
    if ((counts.get(name) ?? 0) > 1) {
      byKey.set(key, operationIdFallbackName(op.operationId));
    }
  }
  return byKey;
}
