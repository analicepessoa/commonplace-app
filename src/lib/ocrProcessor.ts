/**
 * Processamento de OCR de comprovantes (Pix/boleto) com Tesseract.js no
 * client-side. Extrai Valor, Vencimento e Favorecido por regex.
 */

import Tesseract from "tesseract.js";

export interface OcrResult {
  rawText: string;
  amount: number | null;
  dueDate: string | null; // YYYY-MM-DD
  payee: string | null;
}

/** Converte "1.234,56" -> 1234.56 */
function parseBRLNumber(s: string): number {
  return Number(s.replace(/\./g, "").replace(",", "."));
}

/** Extrai os campos do texto reconhecido. */
export function parseReceipt(text: string): Omit<OcrResult, "rawText"> {
  // ---- Valor: pega o maior valor com R$ (geralmente o total) ----
  const amounts = [...text.matchAll(/R\$\s*([\d.]{1,12},\d{2})/gi)].map((m) =>
    parseBRLNumber(m[1]),
  );
  // fallback: número solto no formato 0,00
  if (amounts.length === 0) {
    const loose = [...text.matchAll(/\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g)].map(
      (m) => parseBRLNumber(m[1]),
    );
    amounts.push(...loose);
  }
  const amount = amounts.length ? Math.max(...amounts) : null;

  // ---- Data: dd/mm/aaaa (ou aa) ----
  let dueDate: string | null = null;
  const dm = text.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (dm) {
    const [, d, mo] = dm;
    let y = dm[3];
    if (y.length === 2) y = "20" + y;
    dueDate = `${y}-${mo}-${d}`;
  }

  // ---- Favorecido: linha com palavra-chave ----
  let payee: string | null = null;
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const kw = /(favorecido|benefici[aá]rio|recebedor|para|destinat[aá]rio|nome)/i;
  for (let i = 0; i < lines.length; i++) {
    if (kw.test(lines[i])) {
      const afterColon = lines[i].split(":")[1]?.trim();
      if (afterColon && afterColon.length > 2) {
        payee = afterColon;
        break;
      }
      // senão, próxima linha não vazia
      const next = lines[i + 1]?.trim();
      if (next && next.length > 2) {
        payee = next;
        break;
      }
    }
  }

  return { amount, dueDate, payee };
}

export async function runReceiptOcr(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<OcrResult> {
  const { data } = await Tesseract.recognize(file, "por", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  return { rawText: data.text, ...parseReceipt(data.text) };
}
