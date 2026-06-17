/**
 * CRUD — Finanças: transações (transactions) e metas (financial_goals).
 */

import { supabase } from "@/lib/supabaseClient";
import type {
  Database,
  Transaction,
  FinancialGoal,
  Budget,
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
