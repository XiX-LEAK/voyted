"use client";

import { UniverSheetsCorePreset } from "@univerjs/presets/preset-sheets-core";
import UniverPresetSheetsCoreFrFR from "@univerjs/presets/preset-sheets-core/locales/fr-FR";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { useEffect, useRef } from "react";
import "@univerjs/presets/lib/styles/preset-sheets-core.css";

interface UniverSpreadsheetProps {
  sheetId?: string;
  darkMode?: boolean;
  height?: string;
  onSave?: (snapshot: unknown) => void;
  initialData?: unknown;
}

export default function UniverSpreadsheet({
  sheetId,
  darkMode = false,
  height = "calc(100vh - 180px)",
  onSave,
  initialData,
}: UniverSpreadsheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.FR_FR,
      darkMode,
      locales: {
        [LocaleType.FR_FR]: mergeLocales(UniverPresetSheetsCoreFrFR),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    apiRef.current = univerAPI;

    // Load existing data or create empty workbook
    if (initialData && typeof initialData === "object") {
      try {
        univerAPI.createWorkbook(initialData as any);
      } catch {
        univerAPI.createWorkbook({});
      }
    } else {
      univerAPI.createWorkbook({});
    }

    // Auto-save every 5 seconds
    if (onSave) {
      saveTimerRef.current = setInterval(() => {
        try {
          const workbook = univerAPI.getActiveWorkbook();
          if (workbook) {
            const snapshot = workbook.getSnapshot();
            if (snapshot) {
              onSave(snapshot);
            }
          }
        } catch {
          // Ignore save errors silently
        }
      }, 5000);
    }

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      // Save one last time before disposing
      if (onSave && apiRef.current) {
        try {
          const workbook = apiRef.current.getActiveWorkbook();
          if (workbook) {
            const snapshot = workbook.getSnapshot();
            if (snapshot) onSave(snapshot);
          }
        } catch {
          // Ignore
        }
      }
      univerAPI.dispose();
    };
  }, [sheetId, darkMode]);

  return (
    <div style={{ width: "100%", height }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
