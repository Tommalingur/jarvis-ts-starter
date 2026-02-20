type TrainingSession = {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  note: string;
  createdAt: number;
};

const STORAGE_KEY = 'jarvis_training_log_v1';

function uid(): string {
  return crypto.randomUUID();
}

function loadSessions(): TrainingSession[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as TrainingSession[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: TrainingSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatTotalMinutes(sessions: TrainingSession[]): string {
  const total = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

let sessions: TrainingSession[] = loadSessions().sort((a, b) => b.createdAt - a.createdAt);

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Could not find #app');

app.innerHTML = `
  <main style="font-family: system-ui; max-width: 820px; margin: 40px auto; padding: 0 16px;">
    <h1 style="margin: 0 0 8px;">🧠 Developer Training Log</h1>
    <p style="margin: 0 0 16px; opacity: 0.8;">
      Track your daily coding reps. Stored locally in your browser.
    </p>

    <section style="border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <form id="form" style="display: grid; gap: 12px;">
        <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; align-items: center;">
          <label for="date">Date</label>
          <input id="date" name="date" type="date" required style="padding: 8px;" />
        </div>

        <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; align-items: center;">
          <label for="minutes">Minutes</label>
          <input id="minutes" name="minutes" type="number" min="5" step="5" value="30" required style="padding: 8px;" />
        </div>

        <div style="display: grid; grid-template-columns: 160px 1fr; gap: 12px; align-items: center;">
          <label for="note">Note</label>
          <input id="note" name="note" type="text" maxlength="120" placeholder="What did you work on?" style="padding: 8px;" />
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" id="clear" style="padding: 10px 12px; cursor: pointer;">Clear all</button>
          <button type="submit" style="padding: 10px 12px; cursor: pointer;">Add session</button>
        </div>
      </form>
    </section>

    <section style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
      <h2 style="margin: 0;">Sessions</h2>
      <div id="summary" style="opacity: 0.85;"></div>
    </section>

    <section id="list"></section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#form')!;
const dateInput = document.querySelector<HTMLInputElement>('#date')!;
const minutesInput = document.querySelector<HTMLInputElement>('#minutes')!;
const noteInput = document.querySelector<HTMLInputElement>('#note')!;
const listEl = document.querySelector<HTMLElement>('#list')!;
const summaryEl = document.querySelector<HTMLElement>('#summary')!;
const clearBtn = document.querySelector<HTMLButtonElement>('#clear')!;

// Default date = today (local)
dateInput.value = new Date().toISOString().slice(0, 10);

function render(): void {
  summaryEl.textContent = `${sessions.length} sessions • Total: ${formatTotalMinutes(sessions)}`;

  if (sessions.length === 0) {
    listEl.innerHTML = `
      <div style="border: 1px dashed #bbb; border-radius: 12px; padding: 16px; opacity: 0.8;">
        No sessions yet. Add your first one above.
      </div>
    `;
    return;
  }

  listEl.innerHTML = `
    <div style="display: grid; gap: 10px;">
      ${sessions
        .map((s) => {
          const note = s.note.trim() ? escapeHtml(s.note.trim()) : '<span style="opacity:0.6;">(no note)</span>';
          return `
            <article style="border: 1px solid #ddd; border-radius: 12px; padding: 12px; display: grid; gap: 6px;">
              <div style="display:flex; justify-content: space-between; gap: 12px; align-items: baseline;">
                <strong>${escapeHtml(s.date)}</strong>
                <span style="opacity:0.85;">${s.minutes} min</span>
              </div>
              <div>${note}</div>
              <div style="display:flex; justify-content:flex-end;">
                <button data-action="delete" data-id="${s.id}" style="padding: 6px 10px; cursor:pointer;">
                  Delete
                </button>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function addSession(date: string, minutes: number, note: string): void {
  const session: TrainingSession = {
    id: uid(),
    date,
    minutes,
    note,
    createdAt: Date.now(),
  };
  sessions = [session, ...sessions];
  saveSessions(sessions);
  render();
}

function deleteSession(id: string): void {
  sessions = sessions.filter((s) => s.id !== id);
  saveSessions(sessions);
  render();
}

function clearAll(): void {
  sessions = [];
  saveSessions(sessions);
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = dateInput.value;
  const minutes = Number(minutesInput.value);
  const note = noteInput.value;

  if (!date) return;
  if (!Number.isFinite(minutes) || minutes <= 0) return;

  addSession(date, minutes, note);
  noteInput.value = '';
  noteInput.focus();
});

listEl.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (!(target instanceof HTMLButtonElement)) return;

  if (target.dataset.action === 'delete') {
    const id = target.dataset.id;
    if (id) deleteSession(id);
  }
});

clearBtn.addEventListener('click', () => {
  const ok = confirm('Clear all sessions? This cannot be undone.');
  if (ok) clearAll();
});

render();