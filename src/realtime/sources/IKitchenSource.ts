import type { KitchenSourceEvent } from "@/realtime/types";

export interface IKitchenSource {
    start(): void;
    stop(): void;
    onEvent(cb: (e: KitchenSourceEvent) => void): () => void;
    isConnected(): boolean;
}
