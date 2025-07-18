import admin from "firebase-admin";
import Logger from "../utils/logger";
import { existsSync } from "fs";
import MonkeyError from "../utils/error";
import path from "path";
import { isDevEnvironment } from "../utils/misc";

const SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  "./serviceAccountKey.json"
);

export function init(): void {
  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    if (isDevEnvironment()) {
      Logger.warning(
        "Firebase service account key not found! Continuing in dev mode, but authentication will throw errors."
      );
    } else if (process.env["BYPASS_FIREBASE"] === "true") {
      Logger.warning("BYPASS_FIREBASE is enabled! Running without firebase.");
    } else {
      throw new MonkeyError(
        500,
        "Firebase service account key not found! Make sure generate a service account key and place it in credentials/serviceAccountKey.json.",
        "init() firebase-admin.ts"
      );
    }
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(SERVICE_ACCOUNT_PATH),
    });
    Logger.success("Firebase app initialized");
  }
}

function get(): typeof admin {
  if (admin.apps.length === 0) {
    throw new MonkeyError(
      500,
      "Firebase app not initialized! Make sure generate a service account key and place it in credentials/serviceAccountKey.json.",
      "get() firebase-admin.ts"
    );
  }
  return admin;
}

export default get;
