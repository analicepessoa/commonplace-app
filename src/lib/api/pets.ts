/**
 * CRUD — Pets e seus registros (remédios, vacinas, banhos, peso, notas).
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database, Pet, PetLog } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type PetInsert = Database["public"]["Tables"]["pets"]["Insert"];
type PetLogInsert = Database["public"]["Tables"]["pet_logs"]["Insert"];

export async function listPets(): Promise<Pet[]> {
  return unwrapList(
    "listPets",
    await supabase.from("pets").select("*").order("created_at"),
  );
}

export async function createPet(payload: PetInsert): Promise<Pet> {
  return unwrap(
    "createPet",
    await supabase.from("pets").insert(payload).select().single(),
  );
}

export async function deletePet(id: string): Promise<void> {
  const { error } = await supabase.from("pets").delete().eq("id", id);
  if (error) throw error;
}

export async function listPetLogs(petId: string): Promise<PetLog[]> {
  return unwrapList(
    "listPetLogs",
    await supabase
      .from("pet_logs")
      .select("*")
      .eq("pet_id", petId)
      .order("log_date", { ascending: false }),
  );
}

export async function createPetLog(payload: PetLogInsert): Promise<PetLog> {
  return unwrap(
    "createPetLog",
    await supabase.from("pet_logs").insert(payload).select().single(),
  );
}

export async function deletePetLog(id: string): Promise<void> {
  const { error } = await supabase.from("pet_logs").delete().eq("id", id);
  if (error) throw error;
}

/** Idade legível a partir da data de nascimento. */
export function petAge(birthDate: string | null): string | null {
  if (!birthDate) return null;
  const b = new Date(birthDate + "T00:00:00");
  const now = new Date();
  let months =
    (now.getFullYear() - b.getFullYear()) * 12 +
    (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months--;
  if (months < 0) return null;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} ${rem === 1 ? "mês" : "meses"}`;
  if (rem === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
  return `${years}a ${rem}m`;
}
