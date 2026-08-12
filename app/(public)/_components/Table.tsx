import React from "react";

export function Table({ children, className = "", ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-hair rounded-xl shadow-2xs">
      <table className={`w-full text-left border-collapse text-xs sm:text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-hair/30 font-mono text-[11px] uppercase tracking-wider text-inkSoft border-b border-hair ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-hair/60 bg-paperRaised ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={`bg-hair/20 font-bold border-t border-hair text-ink ${className}`} {...props}>
      {children}
    </tfoot>
  );
}

export function TableRow({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`hover:bg-hair/10 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`p-3 font-semibold text-ink font-mono ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`p-3 text-ink ${className}`} {...props}>
      {children}
    </td>
  );
}

export default Table;
