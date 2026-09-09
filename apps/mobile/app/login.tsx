import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { LoginSchema, type LoginInput, type Role } from "@repo/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { saveRefreshToken } from "@/lib/secure-storage";
import { useAuthStore } from "@/stores/auth-store";
import { useAppColorScheme } from "@/lib/theme";

interface LoginResponse {
  userId: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const { t: tc, isDark } = useAppColorScheme();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: async (data) => {
      await saveRefreshToken(data.refreshToken);
      setAuth(data);
      router.replace("/(tabs)");
    },
  });

  const inputClass = tc(
    "rounded-xl border border-border bg-surface px-4 py-3 text-foreground",
    "rounded-xl border border-border-dark bg-surface-dark px-4 py-3 text-foreground-dark"
  );

  return (
    <View className={tc("flex-1 justify-center gap-4 bg-background px-6", "flex-1 justify-center gap-4 bg-background-dark px-6")}>
      <Text className={tc("font-display text-2xl text-foreground", "font-display text-2xl text-foreground-dark")}>
        {t("auth.loginTitle")}
      </Text>

      <View>
        <Text className={tc("mb-1 text-xs text-muted", "mb-1 text-xs text-muted-dark")}>{t("auth.identifier")}</Text>
        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, value } }) => (
            <TextInput value={value} onChangeText={onChange} autoCapitalize="none" className={inputClass} />
          )}
        />
        {errors.identifier && <Text className="mt-1 text-xs text-verify-red">{errors.identifier.message}</Text>}
      </View>

      <View>
        <Text className={tc("mb-1 text-xs text-muted", "mb-1 text-xs text-muted-dark")}>{t("auth.password")}</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput value={value} onChangeText={onChange} secureTextEntry className={inputClass} />
          )}
        />
        {errors.password && <Text className="mt-1 text-xs text-verify-red">{errors.password.message}</Text>}
      </View>

      {mutation.isError && (
        <Text className="text-sm text-verify-red">
          {mutation.error instanceof ApiError ? mutation.error.message : t("auth.genericError")}
        </Text>
      )}

      <Pressable
        onPress={handleSubmit((values) => mutation.mutate(values))}
        disabled={mutation.isPending}
        className="items-center rounded-full bg-accent-dark py-3"
      >
        {mutation.isPending ? <ActivityIndicator color="#14100B" /> : (
          <Text className="font-medium text-background-dark">{t("auth.login")}</Text>
        )}
      </Pressable>
    </View>
  );
}