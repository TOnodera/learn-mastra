"use server";

import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";

export async function updateUserPlan(plan: string): Promise<void> {
  const headers = await nextHeaders();
  await auth.api.updateUser({
    headers,
    body: { plan }
  });
}
