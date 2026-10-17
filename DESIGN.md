# Design Specifications: CarePortal (Botanical Sanctuary)

> **Extracted from Stitch MCP**  
> **Project Resource**: `projects/9583792503151836418` (`Accessible Health Records App`)  
> **Active Design System**: `Botanical Sanctuary` (`assets/3018693815a64d74b50ef4e53618d10c`)  
> **Archived / Base Design System**: `Clinical Sanctuary` (`assets/226366f8ccdb42759f10fc17b9372066`)  
> **Shared Project Reference**: `projects/16471314136474257399` (`Multi Screen App Flow` / `Clinical Continuum`)  
> **Target Devices**: Mobile iOS/Android Viewport Frame (`390px`–`430px` width) with responsive desktop companion views  
> **Project Type**: `TEXT_TO_UI_PRO`  
> **User Access Role**: `OWNER`

---

## 1. Overview & Brand Philosophy

The **CarePortal** (Accessible Health Records App) is an intelligent, patient-centric healthcare application engineered for longitudinal health management, elderly patient dignity, and caregiver workflows. 

Following the latest project updates in Google Stitch, the application has evolved into the **Botanical Sanctuary** visual ethos, harmonizing clinical rigor with biophilic reassurance, gentle botanical motifs, and calming natural restorative energy.

### Core Brand Principles
- **Nurturing & Restorative**: Replaces sterile, intimidating institutional hospital aesthetics with an organic palette of soothing pale sage, deep forest greens, soft mint accents, and calming ambient glows.
- **Dignified Usability & WCAG AAA Contrast**: Explicitly tailored for older adults and individuals navigating stressful medical journeys. Minimum physical hit targets of 48px–56px, high contrast ratios on all critical text, generous line-heights, and zero low-contrast gray-on-gray text.
- **Certainty in Every Interaction**: Clear confirmation states, unambiguous visual hierarchy, immediate feedback on scheduling and prescription status, and prominent emergency access (SOS).
- **Tactile Modern-Biophilic Healthcare**: Smooth organic curvature (`rounded-xl` to `rounded-3xl` and `rounded-full`), leaf-vein hairline structural scaffolding (`1px solid #DDF5E3`), and luminescent chlorophyll ambient shadows.

---

## 2. Screen Catalog & Information Architecture

| Screen Title | Screen Resource ID | Type / Form Factor | Resolution | Primary Role |
| :--- | :--- | :--- | :--- | :--- |
| **Home - Hospitals & Updates (Bulbasaur Botanical)** | `875cd4e8ef78444ba408256e95111cd0` | Mobile (`MOBILE`) | `780 × 3952` | **Primary Dashboard**: Top CarePortal status bar with Grass Energy badge, quick SOS emergency button, primary patient action cards (Update Profile, Upload Health Report), nearby verified hospital network with calling and booking actions, and floating navigation dock. |
| **Patient Profile (Bulbasaur Botanical)** | `d76e9a1585e44642848a521e9dac1e86` | Mobile (`MOBILE`) | `780 × 3900` | **Patient Identity & Records Portal**: Eleanor Vance summary ribbon, MRN-9482-EV77 badge, expandable demographic/insurance drawer, Emergency Contacts (ICE), HIPAA security badges, and vital statistics. |
| **Past Visits & Clinical History (Bulbasaur Botanical)** | `e1a4cf95583643f086bdb1d7ecdee06a` | Mobile (`MOBILE`) | `780 × 5678` | **EHR & Medical Records**: Search bar, scrollable category filter pills (All Visits, Hospital Admissions, Clinic Consultations), collapsible clinical visit summary cards with diagnoses, prescriptions, and doctor notes. |
| **Find & Book Doctors (Bulbasaur Botanical)** | `783275b9a1dc46bcb187a555d16e515e` | Mobile / Responsive (`MOBILE`) | `780 × 3638` | **Doctor & Specialist Directory**: Search and specialty filter chips, physician profile cards, credential verification badges, star ratings, calendar date/time selectors, and appointment confirmation triggers. |
| **BulbaCare AI Health Assistant** | `5813057d5a9a418c854feb42e84bc607` | Mobile (`MOBILE`) | `780 × 3982` | **Conversational Health Assistant**: Interactive symptom audit chat, medication timeline alerts, personalized wellness metrics, and care bot integration. |
| **CarePortal Holistic Health Sanctuary** | `c52efeeb0909468394d193d5dbcb3cb9` | Mobile (`MOBILE`) | `390 × 884` | **Holistic Sanctuary Overview**: Compact patient orientation dashboard and biophilic vitals tracking view. |

### Visual Reference & Asset Screens
| Reference Name | Screen Resource ID | Dimensions | Role / Usage |
| :--- | :--- | :--- | :--- |
| `IMG-20261016-WA0020.jpg` | `9016789669565168388` | `390 × 884` | Original mobile wireframe screenshot showing card rhythm and identity ribbon. |
| `grass_energy_card_vector_symbol_by_biochao_dezrx3b-fullview.png` | `5052833819397552980` | `1280 × 1278` | Botanical Grass Energy badge utilized in the CarePortal branding logo. |
| `Pixel-art-Bulbizarre-facile-a-recreer-pour-les-fans-de-Pokemon-600x600.webp` | `2916842023981733431` | `600 × 600` | Subtle background watermark asset for botanical styling. |
| `56-566518_bulbasaur-face-drawings-poker-face-pikachu-bulbasaur-poker.jpg` | `7262839229045677280` | `820 × 646` | Secondary botanical watermark graphic asset. |

---

## 3. Complete Color System & Design Tokens

The color palette is tuned specifically for calming medical reassurance, combining a restful pale-sage foundation with vibrant botanical greens, deep forest grounding, and high-contrast typography.

### 3.1 Botanical Sanctuary Core Palette
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `primary` / `botanical-green` | `#3F8F55` | Vibrant botanical green. Core buttons, selected active tabs, active navigation pills, primary status highlights. |
| `primary-container` | `#33844B` | Medium botanical tone for elevated interactive elements and focus rings. |
| `deep-forest` / `secondary` | `#214D38` | Bedrock forest green. Primary headlines, high-emphasis titles, institutional trust badges, dark container backgrounds. |
| `secondary-container` / `soft-mint` | `#DDF5E3` | Soft mint tint. Structural borders, badge backgrounds, selected card states, pill highlights. |
| `tertiary` | `#006858` / `#004537` | Clinical teal / deep emerald. Health confirmation badges, HIPAA certification tags, dosage confirmations. |
| `bulb-teal` | `#45B7A0` | Fresh shoot teal. Vitality trend graphs, secondary badge accents, micro-indicators. |
| `leaf-green` | `#78C850` | Bright photosynthetic green. Live online status dot, active treatment steps, positive affirmations. |
| `surface` / `background` | `#F4F8F0` | Soothing pale sage canvas. Eliminates screen glare while maintaining pristine clinical cleanliness. |
| `surface-container-lowest` | `#FFFFFF` | Pure white elevated cards, input fields, modal sheets, and facility cards. |
| `surface-container-low` | `#F1F5ED` | Sub-container background, inactive filter pills, service tags. |
| `surface-container` | `#EBEFE7` | Dividers, secondary pill action containers, chevron backgrounds. |
| `surface-container-high` | `#E5E9E2` | Card hover states, secondary button hover states. |
| `on-surface` / `on-background` | `#1D3025` / `#181D18` | Slate-forest high-contrast primary text (WCAG AAA compliant). |
| `on-surface-variant` | `#68796C` / `#404940` | Muted sage-slate for supporting body copy, helper text, and timestamps. |
| `outline-variant` | `#DDF5E3` / `#BFC9BD` | Low-contrast hairline borders for clean card boundary definition. |

### 3.2 Status & Emergency Colors
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `error` | `#BA1A1A` / `#B91C1C` | Crimson red for destructive actions, allergy alerts, critical abnormal lab values. |
| `error-container` | `#FFDAD6` / `#FDE8E8` | Soft rose background for the SOS emergency button and critical warning banners. |
| `on-error-container` | `#93000A` | Deep crimson high-contrast text on emergency buttons. |
| `warning` | `#FFF6DF` / `#F59E0B` | Warm cream background with amber text for pending lab results and review alerts. |

---

## 4. Typography Hierarchy

The typography pairs **Plus Jakarta Sans** (humanist geometric letterforms with soft terminals) with **Inter** (clinical data legibility with open counters and tabular numerals).

### 4.1 Type Scale & Specifications
| Token | Font Family | Size | Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Plus Jakarta Sans | `48px` | `56px` | `700` (Bold) | `-0.02em` |
| `display-lg-mobile` | Plus Jakarta Sans | `32px` | `40px` | `700` (Bold) | `-0.015em` |
| `headline-xl` | Plus Jakarta Sans | `36px` | `44px` | `700` (Bold) | `-0.02em` |
| `headline-xl-mobile` | Plus Jakarta Sans | `26px`–`28px` | `34px`–`36px` | `700` (Bold) | `-0.01em` |
| `headline-lg` | Plus Jakarta Sans | `28px`–`30px` | `36px`–`38px` | `600` / `700` | `-0.01em` |
| `headline-md` | Plus Jakarta Sans | `20px`–`22px` | `28px`–`30px` | `600` (Semi-Bold) | `-0.005em` |
| `headline-sm` | Plus Jakarta Sans | `18px` | `26px` | `600` (Semi-Bold) | `0em` |
| `title-md` | Plus Jakarta Sans | `16px` | `24px` | `600` (Semi-Bold) | `0em` |
| `body-lg` | Plus Jakarta Sans / Inter | `16px`–`18px` | `26px`–`28px` | `400` (Regular) | `0em` |
| `body-md` | Plus Jakarta Sans / Inter | `14px`–`16px` | `22px`–`26px` | `400` (Regular) | `0.005em` |
| `body-sm` | Plus Jakarta Sans / Inter | `12px`–`14px` | `18px`–`22px` | `400` (Regular) | `0.01em` |
| `label-lg` | Plus Jakarta Sans / Inter | `14px`–`16px` | `20px`–`24px` | `600` (Semi-Bold) | `0.01em` |
| `label-md` | Plus Jakarta Sans / Inter | `12px`–`14px` | `16px`–`20px` | `600` (Semi-Bold) | `0.02em` |
| `label-sm` | Plus Jakarta Sans / Inter | `10px`–`12px` | `14px`–`16px` | `600` / `700` | `0.04em`–`0.05em` |
| `numeric-data` | Inter / ui-monospace | `18px` | `24px` | `600` (Semi-Bold) | Tabular numbers (`tnum`) |

---

## 5. Spacing, Layout & Elevations

### 5.1 Spacing Scale
- `space-xs`: `0.25rem` (4px) — micro gaps, inline badges
- `space-sm`: `0.50rem` (8px) — icon gaps, button padding
- `space-md`: `1.00rem` (16px) — standard card padding, form control separation
- `space-lg`: `1.50rem` (24px) — section rhythm, generous card margins
- `space-xl`: `2.50rem` (40px) — major screen section anchors

### 5.2 Layout Breakpoints & Containers
- **Mobile Container**: Single-column view constrained to `max-w-[430px]` (or `480px`), centered on the screen with `px-margin` (`1rem`–`1.25rem` / 16px–20px) outer padding.
- **Tablet (641px–1024px)**: 8-column layout, centered content container `max-w-[680px]`, gutter `1.25rem` (20px).
- **Desktop (>1024px)**: 12-column layout, max container `1140px`–`1440px`, gutter `1.5rem` (24px), outer margin `2.5rem` (40px).

### 5.3 Corner Radii
| Token | Value | Applied To |
| :--- | :--- | :--- |
| `rounded-DEFAULT` | `0.25rem` (4px) | Sub-indicators, micro-steppers |
| `rounded-lg` | `0.50rem` (8px) | Form fields, action chips, service tags |
| `rounded-xl` | `0.75rem`–`1.0rem` (12px–16px) | Standard cards, hospital tiles, input wrappers |
| `rounded-2xl` | `1.25rem` (20px) | Prominent action cards, patient identity ribbon |
| `rounded-3xl` | `1.50rem` (24px) | Hero wellness summaries, modal dialogs |
| `rounded-full` | `9999px` | Badges, status pills, filter pills, floating navigation dock |

### 5.4 Elevations & Ambient Lighting
- **Level 0 (Canvas)**: Surface `#F4F8F0`.
- **Level 1 (Clinical Cards & Data Tiles)**: Pure `#FFFFFF` surface bounded by `1px solid #DDF5E3` (or `rgba(63, 143, 85, 0.12)`). Ambient shadow: `0 4px 16px -2px rgba(33, 77, 56, 0.05)`.
- **Level 2 (Active Modals & Hover States)**: `0 8px 24px -4px rgba(33, 77, 56, 0.09)` with border stroke shifting to `rgba(63, 143, 85, 0.28)`.
- **Level 3 (Popovers & Overlays)**: `0 16px 36px -6px rgba(29, 48, 37, 0.14)` with `backdrop-blur-xl`.
- **Floating Bottom Dock**: `0 12px 36px -6px rgba(21, 51, 37, 0.18)` with `inset 0 1px 0 0 rgba(255, 255, 255, 0.9)` and `backdrop-blur-xl`.

---

## 6. Component Specifications

### 6.1 Top Header & Identity Bar
- **Positioning**: Sticky/fixed top (`sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#DDF5E3] pt-safe shadow-subtle`).
- **Brand Identity**: CarePortal Grass Energy logo (`w-8 h-8 rounded-full bg-[#DDF5E3] border border-[#C2ECCC] p-0.5`) with live online pulse indicator (`w-2.5 h-2.5 bg-[#78C850] rounded-full`).
- **Brand Tag**: Pill badge `CarePortal Direct` (`bg-[#DDF5E3]/80 text-[#214D38] border border-[#C2ECCC] font-bold text-xs px-2.5 py-1 rounded-full`).
- **MRN Badge**: Monospace clinical identifier `MRN-9482-EV77` (`bg-[#EBF2E8] text-[#404940] px-2 py-0.5 rounded-md border border-[#DDF5E3] font-mono text-[11px]`).
- **Emergency Button (SOS)**: `h-11 px-3.5 rounded-xl bg-error-container text-on-error-container hover:bg-error hover:text-white transition-all flex items-center gap-1.5 shadow-sm font-bold`.

### 6.2 Prominent Patient Action Cards
- **Dimensions**: Full width, minimum height `72px`, padding `p-4` (16px).
- **Surface**: Pure white (`#FFFFFF`), `rounded-2xl`, border `1px solid #DDF5E3`, subtle shadow `0 4px 18px rgba(19, 106, 52, 0.06)`.
- **Leading Icon Container**: `w-12 h-12 rounded-xl bg-[#DDF5E3] text-[#214D38] flex items-center justify-center font-bold`.
- **Labels**: Title in `font-headline-sm font-bold text-[#1D3025]`, subtitle in `text-body-sm text-[#68796C]`.
- **Trailing Action**: `w-9 h-9 rounded-full bg-[#EBEFE7] flex items-center justify-center text-[#214D38]` with `chevron_right`.

### 6.3 Medical Facility & Hospital Cards
- **Container**: `bg-white rounded-2xl p-4 border border-[#DDF5E3] shadow-card`.
- **Header**: Hospital name (`font-bold text-[#1D3025] text-base`), distance tag (`bg-[#DDF5E3] text-[#214D38] text-xs font-semibold px-2 py-0.5 rounded-full`), star rating with yellow star (`★ 4.8`).
- **Service Chips**: Horizontal row of tags (`bg-[#F1F5ED] text-[#181D18] text-[12px] font-medium px-2.5 py-1 rounded-lg`).
- **Dual Action Buttons**:
  - *Call Button*: `h-11 flex-1 rounded-xl bg-[#EBEFE7] text-[#214D38] font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-[#E5E9E2]`.
  - *Book / View Button*: `h-11 flex-1 rounded-xl bg-[#3F8F55] text-white font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-[#33844B] shadow-sm`.

### 6.4 Filter Pills & Category Selectors
- **Scrollable Row**: Horizontal scroll container (`overflow-x-auto no-scrollbar flex items-center gap-2 pb-1.5`).
- **Active Pill**: `bg-[#3F8F55] text-white font-semibold text-xs px-4 py-2 rounded-full shadow-sm`.
- **Inactive Pill**: `bg-[#F1F5ED] text-[#68796C] hover:bg-[#EBEFE7] font-medium text-xs px-4 py-2 rounded-full transition-colors`.

### 6.5 Floating Bottom Navigation Dock
- **Positioning**: Fixed bottom (`fixed bottom-6 inset-x-0 mx-auto w-fit z-50`).
- **Styling**: `px-3 py-2 bg-white/95 backdrop-blur-xl rounded-full shadow-dock border border-[#DDF5E3] flex items-center gap-1.5`.
- **Active Nav Item**: Pill highlight `bg-[#3F8F55] text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5`.
- **Inactive Nav Item**: `text-[#68796C] hover:text-[#1D3025] hover:bg-[#F1F5ED] text-xs px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors`.
- **Primary Tabs**:
  1. `home` — **Home**
  2. `history` — **History** (Visits & Clinical records)
  3. `calendar_month` — **Book Visit** (Doctor appointments)
  4. `person` — **Profile** (Patient profile & insurance)

---

## 7. Assets & Remote Media Resources

### 7.1 Typography Web Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
```

### 7.2 Material Symbols Iconography
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
```

### 7.3 Verified Media Assets
- **CarePortal Grass Energy Brand Badge**:  
  `https://lh3.googleusercontent.com/aida-public/AB6AXuBmJ2znd3tlN3MvOqdbk67atERtcRQ5nSBtV6SIBEKBew3Lisz7-I4rEDtGIRanMZGTKTnxWNKkiNNGKHV9D3wA0pl3n4BdVnpQZrNqBjVkBq8GIP5haIghsVAFRH3TTQfxIQbPvUAQqmJe2xIY-MiOuvBRJEK2jsAk9-ygNZn4PAOQgrmaKxKA5AhwAIxsdizwhm8ja5y3sHxjA-9y1gnbGQ4qDljLTk27OXqkvXFx6B9FsRFSg5vtt17gMFEnGkckLg`
- **Bulbasaur Pixel Art Watermark Graphic**:  
  `https://lh3.googleusercontent.com/aida-public/AB6AXuBqmEfwf2V3xONT2BU8kqU5SH-D3U_BGodODvMD1aQOL1p64MEA1UdnHGcmz14V5qvLD9MKB8vYz8vyJyUTT4QYiLzFlPwN6V49jkqcr6CJgLg2C6b_FpKh9u9PwGoFkcPVyYZxvz0MIrXk1jAH_hX4RojSUPKmqRTnBGP2LyNRXsVM8XG7TUr88c75FsC8a1kV9x_2-YDIbD5S3Z_nRUbPQnQAH25R-nKQN8vxVVjDKl9YCCqaFfIQX8SI6zG7_whBbw`
- **Bulbasaur Face Line Art Graphic**:  
  `https://lh3.googleusercontent.com/aida-public/AB6AXuDrTaFm1ASdJ3ynxo4t0TNj8keQXc6LHz3PcQ_X0Ael1mcJt4UHISSR5VwcEUYwS3I7gHEdhlTOd9C39gI7grWlLRW1sWvqpOHXE2yQp8mVvcfI4Dz3xD_K4kZfGxwdS7lA6gVm2dKIJjaOLyC1-eaeP4cpSzhaxF2U1ebY1HRmIRRPe3uELkSIz2GjuAF4qqNbkz9Oaw9VTejvwEcXzi9mFdqneqHWMdJ4DtUhmZ8APp4VEDb8s5gm2izDhXfilAZKqQ`
- **Official CarePortal Care Icon Badge**:  
  `https://lh3.googleusercontent.com/aida-public/AB6AXuAZADTqB2my1Cw2QEaw-Hx0y2Qgow08ZSmuBZW1ImKiNED5qDG3_SpWGw2ZBwPXv8jcFHhtIMdpSLuIKwNPSBhtv1urw7IxVe2pNF-TG5S-jqQdhSKQDcqS3Ar1Yu53NVkESu_oB9x4sBLHSQ6HICRaA4lYC1fdbIeJINaVc4p00Z8hxQaNVPXABms1XiI5ukx7uEVFYyU6tKEX2Ml6Xv42PEdCCLxhDUguaSvI8hoWBtXimE-XK7PcJikBdSvpgXAg3g`

---

## 8. Frontend Stack Recommendations & Implementation Plan

### 8.1 Recommended Frontend Stack
1. **Core**: HTML5, Vanilla JavaScript (ESNext modules) with component state routing.
2. **Styling**: Vanilla CSS custom properties matching Stitch tokens (`tokens.css`) paired with modern Tailwind CSS v3 utility classes (`tailwind.config.js`).
3. **Typography & Icons**: Google Fonts CDN (`Plus Jakarta Sans`, `Inter`, `Material Symbols Outlined`).
4. **Dev Server**: Vite for ultra-fast HMR and bundling.

### 8.2 Phased Implementation Plan
- **Phase 1: Token Architecture & Global Foundation**
  - Implement full design system CSS variables in `index.css` (Colors, Spacing, Typography, Elevations).
  - Configure viewport container (`max-w-[430px]` centered iOS frame with responsive tablet/desktop adaptivity).
- **Phase 2: Core Layout Shell & Navigation**
  - Build persistent top navigation bar with CarePortal Grass Energy badge, MRN indicator, and SOS emergency button.
  - Build persistent floating bottom navigation dock with smooth tab transitions.
- **Phase 3: Screen 1 — Home & Hospital Network**
  - Hero patient greeting, prominent action cards (Profile update, Health report upload), nearby hospital directory, call and booking modal triggers.
- **Phase 4: Screen 2 — Patient Profile & Emergency ICE**
  - Eleanor Vance identity ribbon, expandable demographic records, insurance verification cards, emergency contact cards.
- **Phase 5: Screen 3 — Past Visits & Clinical History**
  - Verified EHR search filter, visit categories (All, Hospital, Clinic), collapsible visit summary cards with diagnosis notes and doctor signatures.
- **Phase 6: Screen 4 — Find & Book Doctors**
  - Specialist filters, physician profile cards, calendar booking slot selection, and confirmation drawer.
- **Phase 7: Screen 5 — BulbaCare AI Health Assistant**
  - Interactive triage chat interface with quick symptom chips and vitals telemetry.
