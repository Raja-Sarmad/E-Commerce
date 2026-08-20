"use client";

import { useCallback } from "react";
import { useUploadMediaMutation, useDeleteMediaMutation, useGetMediaQuery } from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";

export function useUpload() {
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  const upload = useCallback(
    async (file: File, name?: string) => {
      const form = new FormData();
      form.append("file", file);
      if (name) form.append("name", name);
      const result = await uploadMedia(form).unwrap();
      return result as {
        _id?: string;
        url?: string;
        name?: string;
        type?: string;
        size?: number;
        publicId?: string;
      };
    },
    [uploadMedia]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteMedia(id).unwrap();
    },
    [deleteMedia]
  );

  return { upload, remove, isUploading, isDeleting };
}

export { getErrorMessage, useGetMediaQuery };
