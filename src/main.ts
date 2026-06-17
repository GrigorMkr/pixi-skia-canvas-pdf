import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import { App } from './app';
import { DOM_IDS } from './constants';

async function main(): Promise<void> {
  const app = new App();

  try {
    await app.init();
  } catch (error) {
    console.error('Initialization failed:', error);

    const log = document.getElementById(DOM_IDS.eventLog);

    if (log) {
      log.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

main();
