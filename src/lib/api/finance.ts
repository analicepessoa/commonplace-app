/**
 * CRUD — Finanças: transações (transactions) e metas (financial_goals).
 */

import { supabase } from "@/lib/supabaseClient";
import type {
  Database,
  Transaction,
  FinancialGoal,
  Budget,
  RecurringTransaction,
} from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];
type GoalInsert = Database["public"]["Tables"]["financial_goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["financial_goals"]["Update"];
type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];
type RecurringInsert =
  Database["public"]["Tables"]["recurring_transactions"]["Insert"];
type RecurringUpdate =
  Database["public"]["Tables"]["recurring_transactions"]["Update"];

// ---------- Transações ----------

export async function listTransactions(): Promise<Transaction[]> {
  return unwrapList(
    "listTransactions",
    await supabase
      .from("transactions")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false }),
  );
}

export async function createTransaction(
  payload: TransactionInsert,
): Promise<Transaction> {
  return unwrap(
    "createTransaction",
    await supabase.from("transactions").insert(payload).select().single(),
  );
}

export async function updateTransaction(
  id: string,
  patch: TransactionUpdate,
): Promise<Transaction> {
  return unwrap(
    "updateTransaction",
    await supabase
      .from("transactions")
      .update(patch)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Metas ----------

export async function listGoals(): Promise<FinancialGoal[]> {
  return unwrapList(
    "listGoals",
    await supabase
      .from("financial_goals")
      .select("*")
      .order("created_at"),
  );
}

export async function createGoal(payload: GoalInsert): Promise<FinancialGoal> {
  return unwrap(
    "createGoal",
    await supabase.from("financial_goals").insert(payload).select().single(),
  );
}

export async function updateGoal(
  id: string,
  patch: GoalUpdate,
): Promise<FinancialGoal> {
  return unwrap(
    "updateGoal",
    await supabase
      .from("financial_goals")
      .update(patch)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("financial_goals").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Orçamentos ----------

export async function listBudgets(): Promise<Budget[]> {
  return unwrapList(
    "listBudgets",
    await supabase.from("budgets").select("*").order("created_at"),
  );
}

export async function createBudget(payload: BudgetInsert): Promise<Budget> {
  return unwrap(
    "createBudget",
    await supabase.from("budgets").insert(payload).select().single(),
  );
}

export async function updateBudget(
  id: string,
  patch: BudgetUpdate,
): Promise<Budget> {
  return unwrap(
    "updateBudget",
    await supabase.from("budgets").update(patch).eq("id", id).select().single(),
  );
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Lançamentos recorrentes (fixos) ----------

export async function listRecurring(): Promise<RecurringTransaction[]> {
  return unwrapList(
    "listRecurring",
    await supabase.from("recurring_transactions").select("*").order("created_at"),
  );
}

export async function createRecurring(
  payload: RecurringInsert,
): Promise<RecurringTransaction> {
  return unwrap(
    "createRecurring",
    await supabase
      .from("recurring_transactions")
      .insert(payload)
      .select()
      .single(),
  );
}

export async function updateRecurring(
  id: string,
  patch: RecurringUpdate,
): Promise<RecurringTransaction> {
  return unwrap(
    "updateRecurring",
    await supabase
      .from("recurring_transactions")
      .update(patch)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteRecurring(id: string): Promise<void> {
  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/**
 * Materializa os lançamentos fixos de um mês: cria a transação real para cada
 * modelo ativo (se ainda não existir). Idempotente — o índice único
 * (recurring_id, due_date) + ignoreDuplicates evita duplicar. Não cria em meses
 * anteriores ao mês de criação do modelo.
 * Retorna as transações recém-criadas neste mês.
 */
export async function ensureRecurringForMonth(
  year: number,
  monthIndex0: number,
): Promise<Transaction[]> {
  const templates = (await listRecurring()).filter((t) => t.active);
  const mm = String(monthIndex0 + 1).padStart(2, "0");
  const monthKeyStr = `${year}-${mm}`;
  const lastDay = new Date(year, monthIndex0 + 1, 0).getDate();
  const created: Transaction[] = [];

  for (const t of templates) {
    if (t.created_at.slice(0, 7) > monthKeyStr) continue; // antes de existir
    const day = Math.min(t.day_of_month, lastDay);
    const due = `${monthKeyStr}-${String(day).padStart(2, "0")}`;
    const { data, error } = await supabase
      .from("transactions")
      .upsert(
        {
          title: t.title,
          amount: t.amount,
          type: t.type,
          due_date: due,
          recurring_id: t.id,
        },
        { onConflict: "recurring_id,due_date", ignoreDuplicates: true },
      )
      .select();
    if (error) {
      console.error("ensureRecurringForMonth:", error);
      continue;
    }
    if (data && data.length) created.push(...data);
  }
  return created;
}
