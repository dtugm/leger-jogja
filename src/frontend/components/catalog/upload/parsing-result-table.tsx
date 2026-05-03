export interface ParsingResult {
  no: number;
  result: string;
  total: number | string;
}

interface ParsingResultTableProps {
  results: ParsingResult[];
}

export default function ParsingResultTable({ results }: ParsingResultTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-10">No</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Parsing Result</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-20">Total</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.no} className="border-b border-border last:border-0">
              <td className="px-3 py-2.5 text-muted-foreground text-xs">
                {String(r.no).padStart(2, "0")}
              </td>
              <td className="px-3 py-2.5 text-foreground">{r.result}</td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {r.total === "..." ? (
                  <span className="text-muted-foreground/50">...</span>
                ) : (
                  r.total
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}