import localFont from "next/font/local";

export const samsungSans = localFont({
  src: [
    {
      path: "../font/sharpSans/SamsungSharpSans-Regular.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../font/sharpSans/SamsungSharpSans-Medium.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../font/sharpSans/SamsungSharpSans-Bold.woff",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-samsungSans",
});

export const one = localFont({
  src: [
    {
      path: "../font/one/SamsungOne-200_v1.1.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../font/one/SamsungOne-300_v1.1.ttf",
      weight: "300",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-one",
});
