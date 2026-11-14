'use client';

import { useState, useTransition, type ChangeEvent } from 'react';
import type { ImportRow } from '@/app/portal/admin/actions';
import { CSV_TEMPLATE } from '@/core/school/parseAccountsCsv';

interface CsvImportProps {
  readonly onImport: (csv: string) => Promise<{ rows: ImportRow[]; error?: string }>;
}

const BUTTON = 'rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold';

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;

/** Many accounts at once from a spreadsheet saved as CSV; the new logins download as one file. */
export function CsvImport({ onImport }: CsvImportProps) {
  const [csv, setCsv] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const created = rows.filter((r) => r.created);

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsv(await file.text());
    }
  };
  const run = () =>
    startTransition(async () => {
      try {
        const result = await onImport(csv);
        setRows(result.rows);
        setError(result.error ?? '');
      } catch {
        setError('The import could not reach the school just now. Try again.');
      }
    });
  const logins = () =>
    download(
      'thuso-new-logins.csv',
      [
        'name,role,id,email,temporary_password,sign_in_at',
        ...created.map((r) =>
          [
            r.created?.name,
            r.created?.role,
            r.created?.id,
            r.created?.email,
            r.created?.password,
            `${location.origin}/login`,
          ]
            .map((v) => quote(v ?? ''))
            .join(','),
        ),
      ].join('\n'),
    );

  return (
    <div className="flex flex-col gap-3 border-t border-ink/10 pt-4">
      <h3 className="font-display text-2xl font-extrabold uppercase">Import a spreadsheet</h3>
      <p className="text-sm">
        In Excel or Google Sheets: one person per row, then <b>Save as / Download → CSV</b>.
        Learners need a grade and a guardian; teachers list classes like{' '}
        <code>10:MATH;11:MATH</code>.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => download('thuso-accounts-template.csv', CSV_TEMPLATE)}
          className={BUTTON}
        >
          ⬇ Template
        </button>
        <label className={`${BUTTON} cursor-pointer`}>
          📄 Choose CSV file
          <input type="file" accept=".csv,text/csv" onChange={choose} className="sr-only" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span>…or paste it here</span>
        <textarea
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          rows={5}
          className="rounded-lg border-2 border-ink/20 bg-white p-2 font-mono text-xs"
          placeholder={CSV_TEMPLATE}
        />
      </label>
      <button
        type="button"
        disabled={isPending || csv.trim() === ''}
        onClick={run}
        className="self-start rounded-full bg-jacaranda-500 px-6 py-2 font-bold text-white disabled:opacity-60"
      >
        {isPending ? 'Creating accounts…' : 'Create these accounts'}
      </button>
      {error && (
        <p role="alert" className="text-sm font-semibold text-ember-700">
          {error}
        </p>
      )}
      {rows.length > 0 && (
        <div className="ask-reply flex flex-col gap-2 rounded-card bg-jacaranda-50 p-3 text-sm">
          <p className="font-semibold">
            ✓ {created.length} created · {rows.length - created.length} need fixing
          </p>
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {rows.map((row) => (
              <li key={row.line}>
                Row {row.line} · {row.name || 'no name'}:{' '}
                {row.created ? `✓ ${row.created.id} (${row.created.email})` : `✗ ${row.error}`}
              </li>
            ))}
          </ul>
          {created.length > 0 && (
            <button
              type="button"
              onClick={logins}
              className={`${BUTTON} self-start bg-ink text-paper`}
            >
              ⬇ Download the {created.length} new logins (CSV)
            </button>
          )}
          <p className="text-xs opacity-80">
            Passwords are shown only now and stored only as hashes.
          </p>
        </div>
      )}
    </div>
  );
}
