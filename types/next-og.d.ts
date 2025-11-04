declare module "next/og" {
  import type { ReactElement } from "react";

  export class ImageResponse extends Response {
    constructor(
      element: ReactElement,
      options?: {
        width: number;
        height: number;
        fonts?: Array<{
          name: string;
          data: ArrayBuffer;
          weight?: number;
          style?: string;
        }>;
      }
    );
  }
}
