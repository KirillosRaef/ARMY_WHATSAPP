declare module "arabic-persian-reshaper" {
  export const ArabicShaper: {
    convertArabic(normal: string): string;
    convertArabicBack(apfb: string): string;
  };
  export const PersianShaper: {
    convertArabic(normal: string): string;
    convertArabicBack(apfb: string): string;
  };
}
