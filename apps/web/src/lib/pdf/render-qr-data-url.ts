export function renderQrDataUrl(value: string, size = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    // Dynamically build a canvas QR using the same encoder qrcode.react uses under the hood
    import("qrcode.react").then(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const { default: QRCodeStyling } = await import("qrcode.react").then(() => ({ default: null as any }));
      // qrcode.react doesn't expose a headless canvas API directly — render it into a hidden
      // React root instead, since that's the library's actual supported surface.
      reject(new Error("use renderHiddenQrToDataUrl instead"));
    });
  });
}