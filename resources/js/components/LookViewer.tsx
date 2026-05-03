export type ColorVariant = {
  name: string;
  color: string;
  images: string[];
  sizes: string[];
};

export type Look = {
  id: string;
  name: string;
  description?: string;
  piece: string;
  price: string;
  variants: ColorVariant[];
};
