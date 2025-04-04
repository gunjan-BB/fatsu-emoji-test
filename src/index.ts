import EmojiPicker from './picker';
import './styles.css';

// Get config from <script src="...?..."> query parameters
function getScriptParams(): Record<string, string> {
  try {
    const currentScript = document.currentScript as HTMLScriptElement;
    if (currentScript?.src) {
      const url = new URL(currentScript.src);
      return Object.fromEntries(url.searchParams.entries());
    }
  } catch (e) {
    console.warn('Could not parse script parameters:', e);
  }
  return {};
}

// Merge global config and script params
const config = {
  ...((window as any).EmojiPickerConfig || {}),
  ...getScriptParams(),
};

// Set the config on the class as a static field
(EmojiPicker as any).globalConfig = config;

export { EmojiPicker };
export default EmojiPicker;
