import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 12, fontFamily: "Helvetica" },
  label: { border: "1 solid #C2790C", borderRadius: 8, padding: 10, flexDirection: "row", gap: 12, alignItems: "center" },
  qrBox: { width: 80, height: 80 },
  infoBox: { flex: 1, justifyContent: "center" },
  brand: { fontSize: 13, fontWeight: 700, color: "#8F590A", marginBottom: 3 },
  code: { fontSize: 9, color: "#6E5B3E", marginBottom: 2 },
  scratchLabel: { fontSize: 8, color: "#6E5B3E", marginTop: 4 },
  scratchValue: { fontSize: 10, fontWeight: 700 },
});

export function BottleLabelDocument({
  bottleCode,
  qrDataUrl,
  scratchCode,
}: {
  bottleCode: string;
  qrDataUrl: string;
  scratchCode: string;
}) {
  return (
    <Document>
      <Page size={[288, 144]} style={styles.page}>
        <View style={styles.label}>
          <Image src={qrDataUrl} style={styles.qrBox} />
          <View style={styles.infoBox}>
            <Text style={styles.brand}>Honey Chain</Text>
            <Text style={styles.code}>{bottleCode}</Text>
            <Text style={styles.scratchLabel}>Scratch to verify:</Text>
            <Text style={styles.scratchValue}>{scratchCode}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}