import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

type Status = "checking" | "ok" | "error";
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export default function HomeScreen() {
  const [status, setStatus] = useState<Status>("checking");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data) => {
        setStatus("ok");
        setDetail(JSON.stringify(data));
      })
      .catch((err) => {
        setStatus("error");
        setDetail(String(err));
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Honey Chain</Text>
      <Text style={styles.apiUrl}>{apiUrl}</Text>
      {status === "checking" && <Text>Checking API connection...</Text>}
      {status === "ok" && <Text style={styles.ok}>Connected - {detail}</Text>}
      {status === "error" && <Text style={styles.error}>Could not reach API: {detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  title: { fontSize: 28, fontWeight: "600" },
  apiUrl: { color: "#888", fontSize: 12 },
  ok: { color: "#3F7F4C" },
  error: { color: "#A83730", textAlign: "center" },
});