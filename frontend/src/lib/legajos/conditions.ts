import { Condition } from "./schema";

export function evalConditions(conds: Condition[]|undefined, values: Record<string, any>): boolean {
  if (!conds || conds.length===0) return true;
  return conds.every(c => {
    const v = values?.[c.key];
    switch (c.op) {
      case "exists": return v !== undefined && v !== null && v !== "";
      case "equals": return v === c.value;
      case "notEquals": return v !== c.value;
      case "gt": return Number(v) > Number(c.value);
      case "lt": return Number(v) < Number(c.value);
      case "in": return Array.isArray(c.value) && c.value.includes(v);
      default: return true;
    }
  });
}
