import { Platform } from "react-native";

import appConfig from "../../app.json";
import { supabase } from "../Database/supaBaseClient";

const FEEDBACK_TABLE = "Feedback";

function getNormalizedString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function getDeviceInfo() {
  const platformConstants = Platform.constants ?? {};
  const parts = [
    Platform.OS ? Platform.OS.toUpperCase() : null,
    Platform.Version !== null && Platform.Version !== undefined
      ? `OS ${Platform.Version}`
      : null,
    platformConstants.Brand ?? platformConstants.brand ?? null,
    platformConstants.Model ?? platformConstants.model ?? null,
  ]
    .map(getNormalizedString)
    .filter(Boolean);

  return parts.length > 0 ? [...new Set(parts)].join(" | ") : null;
}

function getAppVersion() {
  const appVersion = getNormalizedString(appConfig?.expo?.version);
  const androidVersionCode =
    Platform.OS === "android" ? appConfig?.expo?.android?.versionCode : null;

  const parts = [
    appVersion ? `v${appVersion}` : null,
    androidVersionCode ? `build ${androidVersionCode}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : null;
}

export async function submitFeedback({ message, userId = null }) {
  const normalizedMessage = getNormalizedString(message);

  if (!normalizedMessage) {
    throw new Error("Feedback message is required.");
  }

  const payload = {
    message: normalizedMessage,
    device_info: getDeviceInfo(),
    app_version: getAppVersion(),
  };

  if (userId) {
    payload.user_id = userId;
  }

  const { error } = await supabase.from(FEEDBACK_TABLE).insert(payload);

  if (error) {
    throw error;
  }
}
