import { create } from "zustand";

type ImageGeneratedState = {
  images: string[];
  setGeneratedImages: (image: string) => void;
};

// Define the store
const useImageGeneratedStore = create<ImageGeneratedState>()((set) => ({
  images: [],
  setGeneratedImages: (image: string) =>
    set((state: { images: string[] }) => ({
      images: [...state.images, image],
    })),
}));

export default useImageGeneratedStore;
