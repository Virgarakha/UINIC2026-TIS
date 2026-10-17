/**
 * Voice Navigation Engine (Text-To-Speech ala Google Maps)
 * Menggunakan Web Speech Synthesis API berbahasa Indonesia (id-ID)
 */

type VoiceNavListener = (speaking: boolean) => void;

class VoiceNavigationService {
  private isMutedState: boolean = false;
  private lastSpokenText: string = "";
  private lastSpokenTime: number = 0;
  private listeners: Set<VoiceNavListener> = new Set();
  private cachedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("uinic_voice_nav_muted");
      this.isMutedState = stored === "true";

      // Pre-warm voices when available
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoice();
        };
        this.loadVoice();
      }
    }
  }

  public get isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public get isMuted(): boolean {
    return this.isMutedState;
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (typeof window !== "undefined") {
      localStorage.setItem("uinic_voice_nav_muted", String(this.isMutedState));
    }
    if (this.isMutedState) {
      this.stop();
    }
    return this.isMutedState;
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("uinic_voice_nav_muted", String(muted));
    }
    if (muted) {
      this.stop();
    }
  }

  public subscribe(listener: VoiceNavListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean): void {
    this.listeners.forEach((cb) => {
      try {
        cb(speaking);
      } catch (e) {
        console.warn("VoiceNav listener error:", e);
      }
    });
  }

  private loadVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Try to find native Indonesian voice
    const idVoice = voices.find(
      (v) =>
        v.lang === "id-ID" ||
        v.lang.toLowerCase().startsWith("id") ||
        v.name.toLowerCase().includes("indonesia")
    );

    // 2. Fallback to Google / Microsoft default voice
    this.cachedVoice = idVoice || voices[0] || null;
    return this.cachedVoice;
  }

  /**
   * Speak a text with anti-overlap and Indonesian voice calibration
   */
  public speak(
    text: string,
    options: {
      priority?: "normal" | "high";
      force?: boolean;
      rate?: number;
      pitch?: number;
    } = {}
  ): void {
    if (!this.isSupported || this.isMutedState) return;
    if (!text || !text.trim()) return;

    const now = Date.now();
    // Anti-repetition: don't repeat identical text within 4 seconds unless forced
    if (!options.force && text === this.lastSpokenText && now - this.lastSpokenTime < 4000) {
      return;
    }

    try {
      // If high priority, stop current speech immediately
      if (options.priority === "high" || options.force) {
        window.speechSynthesis.cancel();
      }

      this.lastSpokenText = text;
      this.lastSpokenTime = now;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = options.rate || 1.05; // Slightly faster natural pacing
      utterance.pitch = options.pitch || 1.0;

      const voice = this.cachedVoice || this.loadVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.notify(true);
      };

      utterance.onend = () => {
        this.notify(false);
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        this.notify(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Failed to speak text:", e);
      this.notify(false);
    }
  }

  public stop(): void {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.cancel();
      this.notify(false);
    } catch (e) {
      console.warn("Failed to cancel speech:", e);
    }
  }

  // Preset Navigation Phrases

  public testVoice(): void {
    this.speak("Navigasi suara UINIC aktif. Bersiap menuju lokasi tujuan.", {
      priority: "high",
      force: true,
    });
  }

  public announceDeparture(destination: string, distanceStr: string, durationStr: string): void {
    const cleanDest = destination.split(",")[0] || "titik sampah";
    this.speak(
      `Memulai navigasi menuju ${cleanDest}. Jarak sekitar ${distanceStr}, estimasi waktu ${durationStr}. Tetap berhati-hati saat berkendara.`,
      { priority: "high", force: true }
    );
  }

  public announceManeuver(instruction: string, distanceMeters?: number): void {
    if (!instruction) return;
    let spokenText = instruction;
    if (typeof distanceMeters === "number") {
      if (distanceMeters > 50) {
        spokenText = `Dalam ${distanceMeters} meter, ${instruction}`;
      } else {
        spokenText = `${instruction} sekarang`;
      }
    }
    this.speak(spokenText, { priority: "normal" });
  }

  public announceArrival(): void {
    this.speak(
      "Anda telah tiba di lokasi tujuan pengangkutan sampah. Silakan mulai tahap pembersihan.",
      { priority: "high", force: true }
    );
  }

  public announceVerification(cleanlinessScore: number, rewardPoin: number): void {
    this.speak(
      `Pembersihan selesai dan telah diverifikasi oleh AI dengan tingkat kebersihan ${cleanlinessScore} persen. Reward ${rewardPoin} poin reputasi berhasil ditambahkan.`,
      { priority: "high", force: true }
    );
  }
}

export const voiceNavigator = new VoiceNavigationService();
