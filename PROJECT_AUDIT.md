# Audyt Rapid Dominance

Stan na 2026-11-07. Zakres porównania obejmuje jednoosobową i lokalną rozgrywkę przeciw botom; gra sieciowa jest świadomie poza zakresem.

## Źródła reguł

- https://www.enemyflag.net/instrukcja/cel-gry/
- https://www.enemyflag.net/instrukcja/surowce/
- https://www.enemyflag.net/instrukcja/budynki/
- https://www.enemyflag.net/instrukcja/zdobywanie-terenu/
- https://www.enemyflag.net/instrukcja/zarzadzanie-panstwem/
- https://www.enemyflag.net/instrukcja/skroty-klawiaturowe/
- https://www.enemyflag.net/instrukcja/specyfikacja/
- https://github.com/wenta/rapid-dominance/issues

## Znalezione i naprawione problemy

- Przycisk budowy ratusza nie wykonywał żadnej akcji.
- Wieża obserwacyjna była nieaktywną atrapą; teraz można ją budować, uszkadzać i niszczyć, a jej stan wpływa na zasięg mgły wojny.
- Brakowało naprawy, wyburzania i przekazywania 50 złota sojusznikowi.
- Atak nie wymuszał poprawnie wspólnej krawędzi, a ratusz działał także po skosie.
- Krawędź mapy błędnie liczyła się jako własny sektor przy automatycznym przejęciu.
- Gracz o ID `0` mógł zostać zaatakowany przez sojusznika z powodu sprawdzania wartości logicznej identyfikatora.
- Porzucenie pola nie odejmowało PA i było blokowane na całym terytorium, jeśli gracz miał tylko jeden ratusz.
- Bot mógł atakować bez wystarczającej armii lub PA, schodząc do wartości ujemnych.
- Pierwszy barak błędnie dostawał premię za samego siebie.
- Nadmiarowe ratusze na większej mapie dostawały identyfikatory nieistniejących graczy; pozycje startowe są teraz losowane, a pozostałe ratusze są neutralne.
- Obsługa myszy i klawiatury była rejestrowana w każdej klatce, co powodowało narastający wyciek listenerów i wielokrotne reakcje.
- Brakowało prawego kliknięcia do ataku oraz spacji do kończenia tury.
- Złoto z kopalni było losowane raz przy starcie aplikacji zamiast osobno co turę i kopalnię.
- Bazowy przyrost złota, limit PA oraz progi doświadczenia nie zgadzały się z publiczną specyfikacją Enemy Flag.
- Nie naliczano doświadczenia za niszczenie budynków i eliminację gracza ani armii za dwie nieudane próby ataku przeciwnika.
- Lista graczy nie grupowała drużyn, a panel akcji nie zwijał się na małych ekranach.
- Instrukcja była nieaktualna, a plik `pl` zawierał tekst angielski.
- Metadane npm wskazywały stare repozytorium i inną licencję; produkcyjny build działał w trybie developerskim.
- Brakowało zapisu rozgrywki; teraz stan partii jest automatycznie zapisywany, walidowany i możliwy do wznowienia z menu głównego.
- Boty wybierały niemal wyłącznie losowe ataki i zbyt wcześnie stawiały kolejne ratusze. Obecnie oceniają wartość celów, rozwijają kopalnie i armię, naprawiają krytyczne budynki oraz fortyfikują zagrożone granice.
- Ekran startowy korzystał z przypadkowej kreskówkowej grafiki i słabej hierarchii. Został zastąpiony spójną oprawą strategiczną, responsywnym układem konfiguracji oraz czytelniejszym podglądem mapy.
- Uszkodzenie budynku było widoczne wyłącznie jako liczba HP. Atlas zawiera teraz osobne warianty uszkodzone i krytyczne dla ratusza, koszar, kopalni, wieży obserwacyjnej oraz obu murów.
- Menu startowe zostało uproszczone do centralnej konfiguracji bez ciężkiego podglądu planszy; lokalny przełącznik DEV pozwala uruchamiać scenariusze testowe z 10 000 złota i 100 PA.
- Segmenty murów wyglądały jak osobne słupki. Obecnie drewniane i kamienne mury automatycznie tworzą zakończenia, proste odcinki, narożniki, trójniki i skrzyżowania, również po uszkodzeniu.
- Ciężkie nakładki i ciemna korekcja kolorów przytłaczały oprawę. Menu, plansza, atlas budynków i panele otrzymały jaśniejszą, cieplejszą paletę dziennego światła.

## Testy i ryzyka

- `npm test` sprawdza progi doświadczenia, naliczanie PA, premię armii za nieudane ataki i regułę przejęcia z czterech stron.
- `npx tsc --noEmit` sprawdza typy, a `npm run build` tworzy produkcyjny bundle.
- Bundle zawiera całego Phasera i ma około 1,18 MiB; webpack zgłasza ostrzeżenie wydajnościowe, ale build jest poprawny.
- Publiczna instrukcja nie podaje kosztów wieży i naprawy. Zostały wybrane jawne wartości konfiguracyjne: wieża 100 złota / 4 PA, naprawa 25 złota za punkt wytrzymałości / 2 PA.
- Warstwa rozgrywki nadal jest skupiona w dużym `GameScene`; dalszy rozwój warto poprzedzić wydzieleniem czystego silnika reguł i testów scenariuszowych.
