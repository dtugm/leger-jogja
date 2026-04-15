"use client";

/**
 * useApiHandler — React hook version of `withApiHandler`.
 *
 * Provides the same auto-toast behaviour but uses the React context
 * directly, plus exposes an `isLoading` state.
 *
 * Usage:
 * ```tsx
 * const { execute, isLoading } = useApiHandler();
 *
 * const handleDelete = async () => {
 *   const res = await execute({
 *     request: () => ApiDeleteData("/users/1"),
 *     successMessage: "Berhasil dihapus",
 *   });
 *   if (res.success) router.push("/users");
 * };
 * ```
 */

import { useCallback, useState } from "react";

import { useToast } from "@/components/toast";
import type { ApiHandlerOptions, ApiResponse } from "@/types/api";

export function useApiHandler() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T = unknown>(
      options: ApiHandlerOptions<T>,
    ): Promise<ApiResponse<T>> => {
      const {
        request,
        successMessage,
        errorMessage,
        showSuccessToast = true,
        showErrorToast = true,
      } = options;

      setIsLoading(true);

      try {
        const response = await request();

        if (response.success && showSuccessToast) {
          showToast({
            type: "success",
            message: successMessage ?? response.message ?? "Berhasil",
          });
        }

        if (!response.success && showErrorToast) {
          showToast({
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
          showToast({ type: "error", message: msg });
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  return { execute, isLoading };
}
