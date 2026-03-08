# Directorio Morado

A public support directory connecting survivors of sexual violence with organizations, psychological support, legal resources, crisis hotlines, and reproductive rights networks in Mexico and Latin America.

---

## 🎞️ About <a name="about"></a>

<p>
Directorio Morado is a public directory of support resources designed to help survivors of sexual violence and people seeking reproductive rights support in Mexico and Latin America.

With a clear, calm, and accessible interface, the project connects users with organizations, collectives, psychologists, legal services, crisis hotlines, and accompaniment networks.

The goal is to make it easier for people to find help quickly, safely, and anonymously.

<br /><br />

The website is designed with privacy and accessibility in mind. It does not collect personal data, does not require registration, and allows users to explore support resources anonymously.
</p>

---

## 🌐 Live Website

[https://directoriomorado.mx](https://directoriomorado.mx)

---

## 🧭 Features

- 🔎 **Search and filter** — Find support resources by location, type of support, and keywords (fuzzy search)
- 🧠 **Psychological support** — Organizations and professionals offering emotional and psychological support
- ⚖️ **Legal support** — Legal advice and accompaniment resources
- 🌿 **Abortion accompaniment** — Reproductive rights networks and safe abortion support
- 🏛 **Government resources** — Official services (CDMX and national)
- 📞 **Crisis hotline** — 24/7 crisis line information (e.g. 800 911 2000)
- 🔒 **Anonymous browsing** — No login, no personal data collection
- 📱 **Mobile-friendly** — Responsive, accessible interface
- 🏷️ **Visual tags** — Quick scanning by type (e.g. psychological, legal, crisis)

---

## 🧱 Tech Stack

- **Astro** — Static site generation and components
- **TypeScript** — Type-safe code
- **Tailwind CSS** — Styling and design tokens
- **React** — Interactive components (e.g. directory filters, search)
- **Firebase Firestore** — Directory data (source of truth); export to JSON at build for public API and SEO
- **Fuse.js** — Fuzzy search across name, city, state, description, and tags
- **Schema.org** — Structured data (FAQ, Organization, Dataset, etc.) for SEO

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI (landing sections, directory cards, banner, etc.)
├── layouts/          # Page layouts and SEO
├── pages/            # Routes (index, directorio, FAQ, about)
├── data/             # Directory JSON, FAQ, schema helpers
├── styles/           # Global tokens and CSS
├── lib/              # Shared utilities (e.g. tag config)
└── types/            # TypeScript types
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js (v18+ recommended) and npm.

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/directorio-morado.git
   cd directorio-morado
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:4321](http://localhost:4321) in your browser.

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Preview the production build**

   ```bash
   npm run preview
   ```

---

## 🔐 Privacy

Directorio Morado is built with privacy and safety in mind:

- **No login** — The site does not require an account or sign-in.
- **No personal data collection** — We do not track, store, or share visitors’ personal information.
- **Anonymous usage** — You can browse and use the directory without leaving a trace.

The site is intended to be a safe, low-friction way to find support.

---

## 🤝 Contributing

Contributions are welcome. The goal is to keep the directory updated with reliable, accurate resources for survivors and people seeking reproductive support.

If you’d like to contribute (e.g. new resources, corrections, or code improvements), please open an issue or submit a pull request. When suggesting new entries, prefer organizations and services that are well-established and clearly relevant to the directory’s focus.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
