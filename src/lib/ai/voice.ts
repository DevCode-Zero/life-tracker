export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  );
}

export class VoiceRecorder {
  private recognition: any | null = null;
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private isListening = false;

  constructor() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.recognition.onerror = (event: any) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };
    }
  }

  start(): void {
    if (!this.recognition) {
      throw new Error("Speech recognition not supported");
    }
    if (this.isListening) return;

    this.isListening = true;
    this.recognition.start();
  }

  stop(): void {
    if (!this.recognition || !this.isListening) return;

    this.isListening = false;
    this.recognition.stop();
  }

  onResult(callback: (transcript: string) => void): void {
    this.onResultCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  get supported(): boolean {
    return this.recognition !== null;
  }

  get listening(): boolean {
    return this.isListening;
  }
}
