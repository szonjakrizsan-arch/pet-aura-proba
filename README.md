# Pet Aura – próbaoldalak

Kizárólag tesztoldalak valódi telefonos kipróbáláshoz (HTTPS, GitHub Pages). Az alkalmazás kódja nem itt van.

- `kamera/` – Aura Scanner fotózás képernyő: élő kamera a koronás portrékapuban, kozmikus iránytű-exponáló, effektek.
- `igazitas/` – a fotó igazítása a kerek portrékeretben (húzás, nagyítás, hangolás). Esetek: `?faj=biztos` (alap), `?faj=bizonytalan`, `?faj=elteres` (új szöveg, nincs előre kijelölve), `?faj=vendeg` (korábbi változat, megőrizve).
- `elemzes/` – „az aura születése”: három fényhullám, majd kinyílás az eredményre (`?ido=mp` a szerveridő szimulálása, `?mod=galeria` irány nélkül).
- `sikertelen/` – „A tükör még hallgat”: nincs eredmény, új fotó kérése (`?ok=homalyos|arc|sotet|tavol` az ok szerinti tipp; az elemzés oldalon ugyanez a paraméter váltja ki a sikertelen utat).
- `eredmeny/` – a jóváhagyott eredményoldal próbaváltozata (a portrét az előző lépésből kapja; a szövegek és színek mintaadatok).
- `app/` – a teljes Pet Aura app nyilvános tesztmásolata (a privát `pet-aura-app` repóból másolva; csak kipróbálásra).
- `kamera-meret/` – az első, statikus méretpróba (csak kamera + keret).
