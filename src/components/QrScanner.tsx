import { CameraView } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";
import ScannerFrame from "./ScannerFrame";

type Props = {
  onCode: (data: string) => void;
  onClose: () => void;
};

// Camera with a square cut-out in the middle: everything around the frame
// is dimmed, so it is obvious where the QR code has to sit.
export default function QrScanner({ onCode, onClose }: Props) {
  return (
    <View style={styles.fill}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => onCode(String(data))}
      />
      <ScannerFrame onClose={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },
});
