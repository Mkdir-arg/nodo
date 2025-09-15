export function renderTpl(tpl: string, ctx: any) {
  if (typeof tpl !== 'string') return '';
  return tpl.replace(/{{\s*([^}]+)\s*}}/g, (_, path) => {
    const parts = path.trim().split('.');
    let val = ctx;
    for (const p of parts) {
      val = val?.[p];
    }
    return val === undefined || val === null ? '' : String(val);
  });
}
