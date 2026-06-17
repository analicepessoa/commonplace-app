/**
 * CRUD — Saúde: consultas, medicações e ciclos menstruais.
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import type {
  HealthAppointment,
  HealthMedication,
  MenstrualCycle,
} from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type AppointmentInsert =
  Database["public"]["Tables"]["health_appointments"]["Insert"];
type MedicationInsert =
  Database["public"]["Tables"]["health_medications"]["Insert"];
type CycleInsert = Database["public"]["Tables"]["menstrual_cycles"]["Insert"];

// ---------- Consultas ----------

export async function listAppointments(): Promise<HealthAppointment[]> {
  return unwrapList(
    "listAppointments",
    await supabase
      .from("health_appointments")
      .select("*")
      .order("appt_date", { ascending: true, nullsFirst: false }),
  );
}

export async function createAppointment(
  payload: AppointmentInsert,
): Promise<HealthAppointment> {
  return unwrap(
    "createAppointment",
    await supabase
      .from("health_appointments")
      .insert(payload)
      .select()
      .single(),
  );
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from("health_appointments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------- Medicações ----------

export async function listMedications(): Promise<HealthMedication[]> {
  return unwrapList(
    "listMedications",
    await supabase.from("health_medications").select("*").order("name"),
  );
}

export async function createMedication(
  payload: MedicationInsert,
): Promise<HealthMedication> {
  return unwrap(
    "createMedication",
    await supabase
      .from("health_medications")
      .insert(payload)
      .select()
      .single(),
  );
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from("health_medications")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------- Ciclo menstrual ----------

export async function listCycles(): Promise<MenstrualCycle[]> {
  return unwrapList(
    "listCycles",
    await supabase
      .from("menstrual_cycles")
      .select("*")
      .order("start_date", { ascending: false }),
  );
}

export async function createCycle(payload: CycleInsert): Promise<MenstrualCycle> {
  return unwrap(
    "createCycle",
    await supabase.from("menstrual_cycles").insert(payload).select().single(),
  );
}

export async function deleteCycle(id: string): Promise<void> {
  const { error } = await supabase
    .from("menstrual_cycles")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
