export type CondOp = "eq"|"ne"|"in"|"nin"|"gt"|"gte"|"lt"|"lte"|"contains";
export type Condition = { key: string; op: CondOp; value: any };
export function evalConditions(values: Record<string, any>, conds?: Condition[]): boolean {
  if (!conds || conds.length === 0) return false;
  return conds.every(({ key, op, value }) => {
    const v = values?.[key];
    switch (op) {
      case "eq": return v === value;
      case "ne": return v !== value;
      case "in": return Array.isArray(value) && value.includes(v);
      case "nin": return Array.isArray(value) && !value.includes(v);
      case "gt": return typeof v === "number" && v > value;
      case "gte": return typeof v === "number" && v >= value;
      case "lt": return typeof v === "number" && v < value;
      case "lte": return typeof v === "number" && v <= value;
      case "contains":
        return (Array.isArray(v) && v.includes(value)) || (typeof v === "string" && v.includes(String(value)));
      default: return false;
    }
  });
}
