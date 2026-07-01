/**
 * Mídia reutilizável — upload pro Storage (bucket `media`) + anexos
 * polimórficos (qualquer entidade via owner_type/owner_id).
 */

import { supabase } from "@/lib/supabaseClient";
import type { Attachment, AttachmentKind } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

const BUCKET = "media";

/**
 * Sentinela gravada em `attachments.caption` para marcar a foto usada como
 * "capa/crachá" do dono (ex.: foto do pet no crachá). Não é uma legenda de
 * verdade — é filtrada na exibição.
 */
export const COVER_CAPTION = "__cover__";

/**
 * Define (ou remove, com `attachmentId = null`) a foto de capa de um dono.
 * Garante capa única: limpa a marca das demais fotos do mesmo dono antes.
 */
export async function setCoverAttachment(
  ownerType: string,
  ownerId: string,
  attachmentId: string | null,
): Promise<void> {
  const { error: clearErr } = await supabase
    .from("attachments")
    .update({ caption: null })
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .eq("caption", COVER_CAPTION);
  if (clearErr) throw clearErr;

  if (attachmentId) {
    const { error } = await supabase
      .from("attachments")
      .update({ caption: COVER_CAPTION })
      .eq("id", attachmentId);
    if (error) throw error;
  }
}

/** Deduz o tipo de mídia a partir do MIME do arquivo. */
export function kindFromFile(file: File): AttachmentKind {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

export async function listAttachments(
  ownerType: string,
  ownerId: string,
): Promise<Attachment[]> {
  return unwrapList(
    "listAttachments",
    await supabase
      .from("attachments")
      .select("*")
      .eq("owner_type", ownerType)
      .eq("owner_id", ownerId)
      .order("created_at"),
  );
}

/**
 * Faz upload de um arquivo e registra o anexo.
 * Sobe para `media/{ownerType}/{ownerId}/{timestamp}-{nome}`.
 */
export async function uploadAttachment(
  ownerType: string,
  ownerId: string,
  file: File,
): Promise<Attachment> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${ownerType}/${ownerId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) {
    console.error("Erro no upload para o Storage:", upErr);
    throw upErr;
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return unwrap(
    "uploadAttachment.insert",
    await supabase
      .from("attachments")
      .insert({
        owner_type: ownerType,
        owner_id: ownerId,
        kind: kindFromFile(file),
        url: pub.publicUrl,
        storage_path: path,
      })
      .select()
      .single(),
  );
}

/**
 * Sobe um arquivo pro Storage e devolve a URL pública, SEM criar linha em
 * attachments. Usado por elementos do canvas (imagem solta).
 */
export async function uploadToMedia(
  folder: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) {
    console.error("Erro no upload para o Storage:", error);
    throw error;
  }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}

export async function deleteAttachment(att: Attachment): Promise<void> {
  if (att.storage_path) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([att.storage_path]);
    if (error) console.error("Falha ao remover do Storage:", error);
  }
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", att.id);
  if (error) {
    console.error("Supabase error em deleteAttachment:", error);
    throw error;
  }
}
