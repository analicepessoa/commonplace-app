import type {
  StudyPriority,
  StudyTaskStatus,
} from "@/lib/database.types";

export const PRIORITY_LABELS: Record<StudyPriority, string> = {
  essential: "Essencial",
  important: "Importante",
  optional: "Opcional",
};

export const STATUS_LABELS: Record<StudyTaskStatus, string> = {
  planned: "Planejado",
  in_progress: "Em andamento",
  completed: "Concluído",
  postponed: "Adiado",
  cancelled: "Cancelado",
};

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function getMonday(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

export function isValidWebUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

