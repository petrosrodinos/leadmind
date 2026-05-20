import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';

const PDF_FILENAME = 'Economic-activity-codes 2025-KAD 2025.pdf';
const OUTPUT_RELATIVE = '../../app/src/features/gemi/constants/kad-2025.options.ts';

export interface KadEntry {
    code: string;
    descr: string;
    shortDescr?: string;
}

export function parseKadText(text: string): KadEntry[] {
    const entries = new Map<string, KadEntry>();

    for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (!/^\d{7,8}\s/.test(line) || !line.includes('\t')) continue;

        const code = line.match(/^(\d{7,8})/)?.[1];
        if (!code) continue;

        const parts = line.split('\t').map((s) => s.trim()).filter(Boolean);
        const descr = parts[1];
        if (!descr) continue;

        const shortDescr = parts[2];
        if (!entries.has(code)) {
            entries.set(code, { code, descr, shortDescr });
        }
    }

    return [...entries.values()].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
}

function escapeTsString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildOptionsFile(entries: KadEntry[]): string {
    const lines = entries.map((entry) => {
        const label = `${entry.code} — ${entry.descr}`;
        return `    { value: '${escapeTsString(entry.code)}', label: '${escapeTsString(label)}' },`;
    });

    return `export const KAD_2025_OPTIONS = [
${lines.join('\n')}
] as const;

export type Kad2025Option = (typeof KAD_2025_OPTIONS)[number];
`;
}

async function main() {
    const pdfPath = path.resolve(__dirname, '..', PDF_FILENAME);
    const outputPath = path.resolve(__dirname, OUTPUT_RELATIVE);

    if (!fs.existsSync(pdfPath)) {
        console.error(`PDF not found: ${pdfPath}`);
        process.exit(1);
    }

    const buffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buffer });

    console.log('Extracting text from PDF…');
    const started = Date.now();
    const result = await parser.getText();
    console.log(`Parsed ${result.total} pages in ${Date.now() - started}ms`);

    const entries = parseKadText(result.text);
    if (entries.length === 0) {
        console.error('No KAD entries found. Check PDF format.');
        process.exit(1);
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buildOptionsFile(entries), 'utf8');

    console.log(`Wrote ${entries.length} KAD options to ${outputPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
