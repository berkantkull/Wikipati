import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Wikipati – Kedi ve Köpek Bakım Rehberi</title>
        <meta name="description" content="Patili dostun için kaynaklı bakım rehberleri, sağlık kayıtları ve hatırlatmalar." />
        <meta property="og:title" content="Wikipati – Kedi ve Köpek Bakım Rehberi" />
        <meta property="og:description" content="Patili dostun için kaynaklı bakım rehberleri, sağlık kayıtları ve hatırlatmalar." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://raw.githubusercontent.com/berkantkull/Wikipati/master/assets/icon.png" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
