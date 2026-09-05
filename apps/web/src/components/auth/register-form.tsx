"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { UserCreateSchema, type Role } from "@repo/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";

// Same rule as the backend's SELF_REGISTERABLE_ROLES — enforced here too, defense in depth.
const RegisterSchema = UserCreateSchema.extend({
  role: z.enum(["BEEKEEPER", "STORE_OWNER"]),
});
type RegisterInput = z.infer<typeof RegisterSchema>;

interface RegisterResponse {
  userId: string;
  role: Role;
  accessToken: string;
}

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "", role: "BEEKEEPER" },
  });

  const mutation = useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<RegisterResponse>("/auth/register", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (data) => {
      setAuth(data);
      router.push("/");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("email")}</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("password")}</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("role")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="BEEKEEPER">{t("roleBeekeeper")}</SelectItem>
                <SelectItem value="STORE_OWNER">{t("roleStoreOwner")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        {mutation.isError && (
          <p className="text-sm text-verify-red">
            {mutation.error instanceof ApiError ? mutation.error.message : t("genericError")}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? t("registering") : t("register")}
        </Button>
      </form>
    </Form>
  );
}