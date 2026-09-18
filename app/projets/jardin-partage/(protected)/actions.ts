"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { gammVertCookieName } from "@/lib/gamm-vert-auth";

export async function logoutGammVert() {
  const store = await cookies();
  store.set(gammVertCookieName(), "", { httpOnly: true, sameSite: "strict",
    secure: process.env.NODE_ENV === "production", path: "/projets/jardin-partage", maxAge: 0 });
  redirect("/projets/jardin-partage/login");
}
