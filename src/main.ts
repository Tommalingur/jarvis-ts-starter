const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Could not find #app');
}

app.innerHTML = `
  <main style="font-family: system-ui; max-width: 720px; margin: 40px auto; padding: 0 16px;">
    <h1>🚀 Jarvis Dev Comeback</h1>
    <p>TypeScript is running. Vite hot reload is active.</p>

    <button id="btn" style="padding: 10px 14px; cursor: pointer;">
      Click me
    </button>

    <p id="status" style="margin-top: 16px;"></p>
  </main>
`;

const button = document.querySelector<HTMLButtonElement>('#btn');
const status = document.querySelector<HTMLParagraphElement>('#status');

if (!button || !status) {
  throw new Error('Missing UI elements');
}

let clicks = 0;

button.addEventListener('click', () => {
  clicks += 1;
  status.textContent = `Clicks: ${clicks}`;
});
