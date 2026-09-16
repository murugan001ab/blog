"use server";

import { redirect } from "next/navigation";

import { endSession, startSession, verifyPassword } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!verifyPassword(password)) {
    // Deliberately vague — don't confirm whether a password came close.
    return { error: "Incorrect password." };
  }

  await startSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}
