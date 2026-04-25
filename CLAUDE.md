# Touchgrass

A mobile application to help users discover new hobbies, activities, and experiences that feel personally meaningful and realistically achievable.

---

## Context Files

Read the following to get full project context before making changes:

* .claude/context/project-overview.md
* .claude/context/workflow.md
* .claude/context/current-feature.md

Always read context files before implementing features.

---

## Setup

If not already in the project directory:

```bash
cd touchgrass
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm start
```

For platform-specific development:

```bash
npm run ios
npm run android
npm run web
```

Lint project:

```bash
npm run lint
```

---

## Stack

* React Native
* Expo (SDK 54)
* Expo Router (file-based routing)
* TypeScript
* NativeWind v4 (TailwindCSS for React Native)
* react-native-svg
* lucide-react-native (icons)
* expo-image, expo-linear-gradient
* react-native-safe-area-context
* react-native-reanimated
* ESLint

---

## Notes

This project uses:

```json
"main": "expo-router/entry"
```

This means Expo Router conventions should always be preferred over manually configuring raw React Navigation.

Avoid generating traditional React Navigation boilerplate when routing can be handled with Expo Router file-based navigation.

Also verify whether NativeWind is installed if Tailwind styling is expected in React Native, since plain Tailwind alone does not provide full React Native utility class support.
