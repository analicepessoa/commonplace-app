/**
 * Helpers de tratamento de erros para as funções de acesso a dados.
 *
 * Padroniza o consumo das respostas `{ data, error }` do Supabase:
 *  - em caso de erro, lança um `ApiError` com contexto legível;
 *  - em caso de sucesso, devolve `data` já tipado.
 *
 * Componentes podem usar try/catch e exibir `error.message` ao usuário.
 */

import type { PostgrestError } from "@supabase/supabase-js";

export class ApiError extends Error {
  readonly context: string;
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;

  constructor(context: string, cause: PostgrestError | Error) {
    const isPostgrest = "code" in cause || "details" in cause || "hint" in cause;
    super(`[${context}] ${cause.message}`);
    this.name = "ApiError";
    this.context = context;
    if (isPostgrest) {
      const pg = cause as PostgrestError;
      this.code = pg.code;
      this.details = pg.details ?? undefined;
      this.hint = pg.hint ?? undefined;
    }
  }
}

/**
 * Desembrulha uma resposta single-row do Supabase, lançando ApiError
 * com contexto se houver falha.
 */
export function unwrap<T>(
  context: string,
  response: { data: T; error: PostgrestError | null },
): NonNullable<T> {
  if (response.error) {
    console.error(`Supabase error em ${context}:`, response.error);
    throw new ApiError(context, response.error);
  }
  if (response.data === null || response.data === undefined) {
    throw new ApiError(
      context,
      new Error("Nenhum dado retornado (esperava ao menos uma linha)."),
    );
  }
  return response.data as NonNullable<T>;
}

/**
 * Variante para listas: trata `null` como lista vazia em vez de erro.
 */
export function unwrapList<T>(
  context: string,
  response: { data: T[] | null; error: PostgrestError | null },
): T[] {
  if (response.error) {
    console.error(`Supabase error em ${context}:`, response.error);
    throw new ApiError(context, response.error);
  }
  return response.data ?? [];
}
