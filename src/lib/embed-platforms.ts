// Platform-specific embed instructions for the widget builder modal.
// Each platform defines numbered steps. The step with `hasCode: true` is where
// the embed code block should be rendered inline.

export type WebPlatform = 'wix' | 'squarespace' | 'webflow' | 'framer' | 'wordpress' | 'other';

export interface PlatformStep {
  text: string;
  hasCode?: boolean;
}

export interface Platform {
  id: WebPlatform;
  name: string;
  steps: PlatformStep[];
}

export const PLATFORMS: Platform[] = [
  {
    id: 'wix',
    name: 'Wix',
    steps: [
      { text: 'Open your Wix Editor and go to the page where you want testimonials' },
      { text: 'Click the "+" button, then "Embed" then "Custom Embeds" then "Embed a Widget"' },
      { text: 'Click "Enter Code" and paste this code:', hasCode: true },
      { text: 'Adjust the size of the block if needed, then click "Publish"' },
    ],
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    steps: [
      { text: 'Edit your page in Squarespace' },
      { text: 'Click "+" to add a new block, then choose "Code"' },
      { text: 'Make sure the toggle says "HTML", then paste this code:', hasCode: true },
      { text: 'Click outside the block to close it, then click "Save"' },
    ],
  },
  {
    id: 'webflow',
    name: 'Webflow',
    steps: [
      { text: 'Open your page in the Webflow Designer' },
      { text: 'From the left panel, drag an "Embed" element to where you want testimonials' },
      { text: 'Paste this code into the embed editor:', hasCode: true },
      { text: 'Click "Save & Close", then hit "Publish" in the top right' },
    ],
  },
  {
    id: 'framer',
    name: 'Framer',
    steps: [
      { text: 'Open your page in the Framer editor' },
      { text: 'Press "/" to open the insert menu, then search for "Embed"' },
      { text: 'In the embed settings, choose "HTML" and paste this code:', hasCode: true },
      { text: 'Position the element where you want it, then click "Publish"' },
    ],
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    steps: [
      { text: 'Edit your page or post in WordPress' },
      { text: 'Click "+" to add a new block, then search for "Custom HTML"' },
      { text: 'Paste this code into the HTML block:', hasCode: true },
      { text: 'Click "Update" or "Publish" to save your page' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    steps: [
      { text: 'Open the page where you want to show testimonials in your website editor' },
      { text: 'Look for an option called "Embed", "Custom Code", "HTML block", or similar' },
      { text: 'Paste this code into the embed area:', hasCode: true },
      { text: 'Save and publish your page' },
    ],
  },
];
