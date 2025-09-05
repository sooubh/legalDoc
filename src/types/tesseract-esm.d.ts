declare module 'tesseract.js/dist/tesseract.esm.min.js' {
  import type { RecognizeResult, Worker, PSM, OEM } from 'tesseract.js';
  export interface LoggerMessage {
    status?: string;
    progress?: number;
  }
  export function recognize(
    image: ImageData | HTMLCanvasElement | HTMLImageElement | string,
    langs?: string,
    options?: { logger?: (m: LoggerMessage) => void }
  ): Promise<RecognizeResult>;
  export function createWorker(options?: any): Worker;
  const Tesseract: {
    recognize: typeof recognize;
    createWorker: typeof createWorker;
    PSM: PSM;
    OEM: OEM;
  };
  export default Tesseract;
}
