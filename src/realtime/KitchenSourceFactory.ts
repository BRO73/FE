import type { IKitchenSource } from "./sources/IKitchenSource";
import { RestPollSource } from "./sources/RestPollSource";

/**
 * Hiện tại dùng REST poll.
 * Sau này thêm WebSocket:
 * const { WsSource } = await import("./sources/WsSource"); return new WsSource();
 */
export async function createKitchenSource(): Promise<IKitchenSource> {
    return new RestPollSource(3000);
}
