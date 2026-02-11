# Language System Implementation Guide

## Overview
The website now supports English and Tagalog languages. The language switcher is available in the header and allows users to switch between the two languages seamlessly.

## Implementation Details

### 1. Language Context (`src/context/LanguageContext.tsx`)
- Manages the current language state (English or Tagalog)
- Provides translation function `t(key)` to get translated strings
- Automatically saves language preference to localStorage
- Dynamically loads translation files based on selected language

### 2. Translation Files
- **English**: `src/translations/en.ts`
- **Tagalog**: `src/translations/tl.ts`

Each file contains key-value pairs for translations organized by sections:
- Navigation
- Common UI elements
- Home page
- Tours
- Booking
- Settings
- Contact
- Footer
- Error messages

### 3. Language Switcher Component
The updated `LanguageSwitcher` component features:
- Dropdown menu with English and Tagalog options
- Visual indicator showing current language
- Globe icon for easy recognition
- Smooth transitions and hover effects

## Usage in Your Components

### Basic Usage

```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button>{t('common.bookNow')}</button>
    </div>
  );
}
```

### Getting Current Language

```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { language, t } = useLanguage();
  
  // Use language code if needed
  const formatDate = (date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'tl-PH');
  };
  
  return <div>{t('home.hero.title')}</div>;
}
```

### Changing Language Programmatically

```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { setLanguage } = useLanguage();
  
  const switchToTagalog = () => {
    setLanguage('tl');
  };
  
  return <button onClick={switchToTagalog}>Switch to Tagalog</button>;
}
```

## Adding New Translations

### Step 1: Add to English translations (`src/translations/en.ts`)
```typescript
const translations = {
  // ... existing translations
  'tours.newFeature': 'New Feature Text',
};
```

### Step 2: Add to Tagalog translations (`src/translations/tl.ts`)
```typescript
const translations = {
  // ... existing translations
  'tours.newFeature': 'Bagong Feature na Teksto',
};
```

### Step 3: Use in your component
```tsx
function MyComponent() {
  const { t } = useLanguage();
  return <div>{t('tours.newFeature')}</div>;
}
```

## Translation Key Naming Convention

Use dot notation to organize translations by section:
- `section.subsection.key`

Examples:
- `nav.home` - Navigation items
- `common.save` - Common UI elements
- `tours.duration` - Tours section
- `booking.confirm` - Booking section
- `error.general` - Error messages

## Example: Updating TourBuilder Component

Here's how to add translations to the TourBuilder page:

```tsx
import { useLanguage } from '../context/LanguageContext';

export default function TourBuilder() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('tourBuilder.title')}</h1>
      
      <label>{t('tourBuilder.selectDate')}</label>
      
      <button>{t('tourBuilder.proceedToBooking')}</button>
      
      <div>
        {t('tourBuilder.totalCost')}: {formatCurrency(totalCost)}
      </div>
    </div>
  );
}
```

## Features

✅ Automatic language detection from localStorage
✅ Smooth language switching without page reload
✅ Persistent language preference
✅ Easy-to-use translation function
✅ Organized translation files
✅ Type-safe language codes

## Next Steps

1. **Update existing pages** to use the `t()` function for all text content
2. **Add more translations** as you add new features
3. **Test thoroughly** to ensure all text is properly translated
4. **Consider adding more languages** by creating new translation files (e.g., `es.ts` for Spanish)

## Tips

- Always add translations for both languages when adding new features
- Use descriptive translation keys
- Group related translations together
- Test language switching on all pages
- Keep translation strings consistent across languages in terms of tone and meaning
