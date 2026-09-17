import ImageKit from "imagekit";

/**
 * Single shared ImageKit client. Used server-side only (actions.ts / store.ts) —
 * the private key must never reach the browser.
 */
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

/** Every upload lives under this folder in your ImageKit media library. */
export const IMAGEKIT_FOLDER = "/blog-uploads";
