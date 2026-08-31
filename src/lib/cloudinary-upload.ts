type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
  const folder =
    process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER?.trim() || "ecommerce/products";

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured on the frontend. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return { cloudName, uploadPreset, folder };
}

/** Upload a file directly from the browser to Cloudinary (bypasses Vercel server timeout). */
export async function uploadFileToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset, folder } = getCloudinaryConfig();

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const result = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(result?.error?.message || "Cloudinary upload failed.");
  }

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary did not return a valid image URL.");
  }

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadFilesToCloudinary(files: File[]): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];
  for (const file of files) {
    results.push(await uploadFileToCloudinary(file));
  }
  return results;
}
