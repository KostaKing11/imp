import jsQR from "jsqr";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../i18n";
import ScannerFrame from "./ScannerFrame";

type Props = {
  onCode: (data: string) => void;
  onClose: () => void;
};

// Browser version of the scanner. Safari on the iPhone has no barcode
// support of its own, so the camera goes into a <video>, frames are read
// off a canvas and decoded here.
export default function QrScanner({ onCode, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Decoding the whole frame is plenty at this size and keeps the
        // reader forgiving about exactly where the code sits.
        const w = (canvas.width = video.videoWidth);
        const h = (canvas.height = video.videoHeight);
        if (w && h) {
          ctx.drawImage(video, 0, 0, w, h);
          const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, {
            inversionAttempts: "dontInvert",
          });
          if (found?.data) {
            stopped = true;
            onCode(found.data);
            return;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          // iOS only plays inline when told to, and only after this call.
          video.setAttribute("playsinline", "true");
          await video.play().catch(() => {});
        }
        raf = requestAnimationFrame(tick);
      } catch {
        setProblem(t("cameraBlocked"));
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.fill}>
      {/* react-native-web renders to the DOM, so a plain video works here */}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <ScannerFrame onClose={onClose} message={problem} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },
});
