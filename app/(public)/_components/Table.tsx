import React from "react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Names the scroll region. Give every table one. */
  label?: string;
}

export function Table({ children, className = "", label, ...props }: TableProps) {
  return (
    // A bare overflow-x-auto div scrolls with a pointer but cannot be reached
    // by keyboard, so a wide table's right-hand columns were unreachable
    // without a mouse. tabIndex + role make it a focusable scroll region
    // (DESIGN_SYSTEM.md §8.7).
    <div
      className="w-full overflow-x-auto border border-hair rounded-xl"
      tabIndex={0}
      role="region"
      aria-label={label ?? "Table"}
    >
      <table className={`w-full text-left border-collapse text-xs sm:text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-hair/30 font-mono text-xs uppercase tracking-wider text-inkSoft border-b border-hair ${className}`} {...props}>
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
