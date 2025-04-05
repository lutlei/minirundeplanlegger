# Minirundeplanlegger

En webapplikasjon for planlegging av fotballturneringer, spesielt tilpasset for minirunder for barn og ungdom.

## Implementerte funksjoner

- **Lagpåmelding**: Registrer lag med navn og alderskategorier (Mikro, Mini, Lillegutt/jente)
- **Turneringsinnstillinger**: Konfigurer kampvarighet, baner, start- og sluttider
- **Automatisk kampoppsett**: Generering av puljer og kampskjema basert på påmeldte lag
- **Intelligent kampplanlegging**:
  - Fordeling av lag i puljer for jevn konkurranse
  - Minimale pauser mellom kamper for samme lag
  - Kategori-spesifikke dager (Mikro på lørdag, Lillegutt/jente på søndag)
  - Respekt for bane-begrensninger og maksimal spilletid
- **Filtrerbart kampprogram**: Sorter og filtrer etter lag, kategori eller dag
- **Tema-støtte**: Veksle mellom lyst og mørkt tema
- **Responsivt design**: Fungerer på både mobil og desktop
- **AI Chat-assistent**: OpenAI-drevet assistent for hjelp med turneringsplanlegging

## Teknisk oppsett

Dette prosjektet er bygget med:

- [Next.js](https://nextjs.org/) - React-rammeverk med Pages Router
- [TypeScript](https://www.typescriptlang.org/) - Typet JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS-rammeverk
- [OpenAI API](https://platform.openai.com/) - API for AI-assistenten

## Prosjektstruktur

```
minirundeplanlegger/
├── components/              # React-komponenter
│   ├── ChatAssistant.tsx    # AI chat-assistent
│   ├── LandingPage.tsx      # Velkomstside
│   ├── MessageBox.tsx       # Notifikasjonskomponent 
│   ├── ScheduleDisplay.tsx  # Kampprogram-visning
│   ├── TeamsList.tsx        # Laginformasjon
│   └── TournamentPlanner.tsx # Hovedkomponent for turneringsplanlegging
├── lib/                     # Hjelpefunksjoner
│   └── tournamentUtils.ts   # Logikk for turneringsplanlegging
├── pages/                   # Next.js sider
│   ├── api/                 # API-endepunkter
│   │   └── chat.ts          # Endepunkt for chat-assistenten
│   ├── _app.tsx             # Custom App-komponent
│   ├── index.tsx            # Landingsside
│   └── planner.tsx          # Turneringsplanlegger-side
└── styles/                  # CSS-filer
    └── globals.css          # Globale stiler inkludert Tailwind
```

## Kom i gang

### Forutsetninger

- Node.js 18.x eller nyere
- npm eller yarn

### Installasjon

1. Klone repoet
   ```
   git clone https://github.com/yourusername/minirundeplanlegger.git
   cd minirundeplanlegger
   ```

2. Installer avhengigheter
   ```
   npm install
   ```

3. Kopier `.env.local.example` til `.env.local` og oppdater med din OpenAI API-nøkkel
   ```
   cp .env.local.example .env.local
   ```
   
   Deretter rediger `.env.local` filen og sett inn din OpenAI API-nøkkel:
   ```
   OPENAI_API_KEY=din-api-nøkkel-her
   ```

4. Start utviklingsserveren
   ```
   npm run dev
   ```

5. Åpne [http://localhost:3000](http://localhost:3000) i nettleseren

### Bygg for produksjon

```
npm run build
npm start
```

## Bruk

1. Start på landings-siden og klikk på "Start planlegging"
2. Bruk arrangør-fanen til å konfigurere turneringsinnstillinger
3. Legg til lag via påmeldingsfanen
4. Generer kampprogram og se resultatene i kampprogramfanen
5. Bruk chat-assistenten for å få hjelp med turneringsrelaterte spørsmål

## Algoritmiske detaljer

Turneringsplanleggeren bruker flere algoritmer for å sikre et godt kampoppsett:

1. **Puljeinndeling**: Lag innen samme kategori deles inn i puljer av passende størrelse
2. **Round-robin parkamper**: Hvert lag i en pulje spiller mot alle andre lag i puljen
3. **Tidsbesparende planlegging**: Kamper planlegges med hensyn til:
   - Minimum pausetid mellom kamper for samme lag
   - Maksimal total spilletid per lag per dag
   - Banekapasitet og tilgjengelighet
   - Kategori-spesifikke dager

## Fremtidige forbedringer

- Lagring av turneringsinformasjon til database
- Eksport av kampprogram til PDF
- Resultatføring og tabellberegning
- Admin-grensesnitt for turneringsarrangører
- Flerspråksstøtte (norsk/engelsk)

## Lisens

Dette prosjektet er lisensiert under MIT-lisensen. Se LICENSE-filen for mer informasjon. 