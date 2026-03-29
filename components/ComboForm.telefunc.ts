import { saveUploadedFile } from "@/server/utils/save-upload";

export const onUploadFile = async (file: File) => {
  const url = await saveUploadedFile(file);
  return { url };
};
