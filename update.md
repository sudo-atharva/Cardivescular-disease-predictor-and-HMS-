<!--
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
-->

Fixes implemented:
- Device-to-patient mapping
  - Monitoring UI now lets you set a device base URL per patient; readings route only to the selected patient.
  - Switching patients updates the HTTP vitals client to the patient’s device and reconnects fast.
  - Server-side PATCH endpoint allows persisting `deviceId`/`deviceUrl` to the patient.

- AI + ML outputs
  - Diagnosis action now fetches vitals from the patient’s mapped device URL (fallbacks preserved).
  - Added a lightweight ML-style risk score alongside the AI report and saved it into `mlDiagnosis` for the latest report.

- Charts stability
  - Readings are sorted, filtered, and downsampled; charts use monotone curves and fixed domains to stop jittering.

How to use:
- In a patient detail page, type the ESP32 base URL (e.g., http://192.168.1.50) in the monitoring card and Start Monitoring. Only that patient will receive those readings now.
- Generate disease prediction; the saved report includes both ML risk and AI text.

References:
- Heart disease ML baseline inspiration: `https://github.com/g-shreekant/Heart-Disease-Prediction-using-Machine-Learning`

Edits:
- `src/lib/monitoring-state.ts`: added `patientDeviceUrlById`, `setPatientDeviceUrl`, `getPatientDeviceUrl`.
- `src/components/monitoring-control.tsx`: added device URL input; routes vitals to selected patient/device; hot-reconnect on change.
- `src/components/patient-charts.tsx`: sort/filter/downsample; switch to monotone curves; retain fixed domains.
- `src/app/api/patients/[patientId]/route.ts`: added PATCH to update `deviceId`/`deviceUrl`.
- `src/lib/models.ts`: added optional `deviceUrl`.
- `src/lib/http-vitals.ts`: `setBaseUrl` now resets backoff and restarts polling when active.
- `src/lib/actions.ts`: fetch vitals from mapped device; compute and store ML risk; include both outputs when updating `mlDiagnosis`.

What’s still open:
- Optional: Persist device URL from UI via the new PATCH endpoint (right now it’s stored locally and used for monitoring; server AI uses DB value if you update it via API). Want me to wire an Update button in the monitoring card to call the PATCH so backend always has the patient’s device URL?
- Optional perf: Reduce initial fetch fan-out, add memoization to dashboard queries, and throttle polling when tab isn’t visible.