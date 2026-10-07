import { SupabaseClient } from "npm:@supabase/supabase-js@^2.49.1";
import { ClientEntity, MessageEntity } from "../domain/entities.ts";
import { IBotDatabaseRepository } from "../ports/index.ts";

export class SupabaseBotRepository implements IBotDatabaseRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async upsertClientActivity(clientData: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    activityAt?: Date;
  }): Promise<void> {
    const activityIso = (clientData.activityAt || new Date()).toISOString();

    const payload: Record<string, unknown> = {
      id: clientData.id,
      last_activity_at: activityIso,
    };

    if (clientData.firstName !== undefined) payload.first_name = clientData.firstName;
    if (clientData.lastName !== undefined) payload.last_name = clientData.lastName;
    if (clientData.username !== undefined) payload.username = clientData.username;

    // Сначала пробуем сделать update существующей записи
    const { data: updated, error: updateError } = await this.client
      .from("clients")
      .update(payload)
      .eq("id", clientData.id)
      .select("id");

    if (updateError) {
      console.error("Error updating client activity:", updateError);
      throw updateError;
    }

    // Если клиента еще нет в базе, вставляем новую запись
    if (!updated || updated.length === 0) {
      const { error: insertError } = await this.client
        .from("clients")
        .insert({
          id: clientData.id,
          first_name: clientData.firstName ?? null,
          last_name: clientData.lastName ?? null,
          username: clientData.username ?? null,
          last_activity_at: activityIso,
        });

      if (insertError) {
        console.error("Error inserting client:", insertError);
        throw insertError;
      }
    }
  }

  async saveMessage(message: {
    clientId: number;
    sender: "client" | "bot";
    text: string;
    createdAt?: Date;
  }): Promise<void> {
    const createdIso = (message.createdAt || new Date()).toISOString();

    const { error } = await this.client
      .from("messages")
      .insert({
        client_id: message.clientId,
        sender: message.sender,
        text: message.text,
        created_at: createdIso,
      });

    if (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  async getAllClientsRecentFirst(): Promise<ClientEntity[]> {
    const { data, error } = await this.client
      .from("clients")
      .select("*")
      .order("last_activity_at", { ascending: false });

    if (error) {
      console.error("Error getting clients:", error);
      throw error;
    }

    return (data || []) as ClientEntity[];
  }

  async getAllMessagesRecentFirst(): Promise<MessageEntity[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting messages:", error);
      throw error;
    }

    return (data || []) as MessageEntity[];
  }
}
