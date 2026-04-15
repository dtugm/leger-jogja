/**
 * Cara Pakenya
 * import { withApiHandler } from "@/utils/with-api-handler";
 * import { ApiDeleteData } from "@/services/api";
 *
 * const result = await withApiHandler({
 *   request: () => ApiDeleteData("/users/1"),
 *   successMessage: "Data berhasil dihapus",
 *   errorMessage: "Gagal menghapus data",
 * });
 */

import { toastEmitter } from "@/components/toast";
import type { ApiHandlerOptions, ApiResponse } from "@/types/api";

export async function withApiHandler<T = unknown>(
  options: ApiHandlerOptions<T>,
): Promise<ApiResponse<T>> {
  const {
    request,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  try {
    const response = await request();

    if (response.success && showSuccessToast) {
      toastEmitter.emit({
        type: "success",
        message: successMessage ?? response.message ?? "Berhasil",
      });
    }

    if (!response.success && showErrorToast) {
      toastEmitter.emit({
        type: "error",
        message: errorMessage ?? response.message ?? "Terjadi kesalahan",
      });
    }

    return response;
  } catch (error: unknown) {
    if (showErrorToast) {
      const msg =
        errorMessage ??
        (error instanceof Error ? error.message : "Terjadi kesalahan");
      toastEmitter.emit({ type: "error", message: msg });
    }

    // Re-throw so callers can still catch if needed
    throw error;
  }
}
