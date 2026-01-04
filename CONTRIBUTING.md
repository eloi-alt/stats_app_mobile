# Contributing Guidelines

## Prototype vs. Production
- **Prototype:** This codebase (Next.js/React). Used for design validation, user testing, and feature specification.
- **Production:** Native iOS App (Swift). **Implementation must be done in Swift.**

## Developing the Prototype
If you are contributing to this React prototype:
1. **Code Style:** Use functional React components and TypeScript interfaces.
2. **Styling:** Use Tailwind CSS for layout, vanilla CSS for complex effects.
3. **Accessibility:** Ensure all new components are keyboard accessible and have ARIA labels.

## iOS Implementation Guidelines
When porting features to Swift:
1. **Fidelity:** Match the visual design and animation curves of the prototype.
2. **Performance:** Utilize Metal for 3D components (Social Sphere) instead of WebGL.
3. **Data:** Ensure strict type safety matching `types/UserProfile.ts`.

## Accessibility Standards
Both the prototype and Swift app must adhere to WCAG 2.1 AA standards:
- **Color Contrast:** Ensure text is readable against backgrounds.
- **Dynamic Type:** (iOS) Support system font scaling.
- **VoiceOver:** All functional elements must be discoverable by screen readers.
