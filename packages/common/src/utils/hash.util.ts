import * as crypto from "crypto";

export class HashUtil {
  static hash(data: string, salt?: string): string {
    const useSalt = salt || crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(data, useSalt, 1000, 64, "sha512");
    return `${hash.toString("hex")}.${useSalt}`;
  }

  static verify(data: string, hashedData: string): boolean {
    const [hash, salt] = hashedData.split(".");
    const verifyHash = this.hash(data, salt);
    return verifyHash === hashedData;
  }
}
