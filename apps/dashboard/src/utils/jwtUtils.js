// src/utils/jwtUtils.js
export const parseJwt = (token) => {
  try {
    // Split the token into its three parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Base64Url decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Pad the base64 string if needed
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + new Array(5 - pad).join("=") : base64;

    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
};
