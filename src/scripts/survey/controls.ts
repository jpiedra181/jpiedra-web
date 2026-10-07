import type { SurveyScene } from '../survey-scene';
import type { WeatherKind } from './weather';

// Controles de la escena: pausa del movimiento y panel para cambiar el
// momento (hora, mes y tiempo). Todo con controles nativos, que ya funcionan
// con teclado y lector de pantalla.

const MINUTES_PER_DAY = 1440;
const MID_MONTH_DAY = 15;

interface InitialState {
  moment: Date | null;
  weather: WeatherKind;
}

const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const minutesOf = (date: Date) => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return Math.round(minutes / 15) * 15 % MINUTES_PER_DAY;
};

export function wireSurveyControls(scene: SurveyScene, initial: InitialState): void {
  const pauseButton = document.querySelector<HTMLButtonElement>('[data-pause]');
  const soundButton = document.querySelector<HTMLButtonElement>('[data-sound]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-moment-toggle]');
  const panel = document.getElementById('survey-moment-panel');
  const hour = document.querySelector<HTMLInputElement>('[data-hour]');
  const hourOutput = document.querySelector<HTMLOutputElement>('[data-hour-output]');
  const month = document.querySelector<HTMLSelectElement>('[data-month]');
  const reset = document.querySelector<HTMLButtonElement>('[data-moment-reset]');
  const weatherInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="survey-weather"]'));
  if (!pauseButton || !soundButton || !toggle || !panel || !hour || !hourOutput || !month || !reset) return;

  // --- Sonido --------------------------------------------------------------
  // Apagado por defecto: el navegador solo deja sonar audio tras un gesto, y
  // nadie debería encontrarse una web que suena sin haberlo pedido.

  soundButton.addEventListener('click', async () => {
    await scene.setSound(!scene.isSoundOn());
    soundButton.setAttribute('aria-pressed', String(scene.isSoundOn()));
  });

  // --- Pausa ---------------------------------------------------------------

  const showPaused = () => pauseButton.setAttribute('aria-pressed', String(scene.isPaused()));
  pauseButton.addEventListener('click', () => {
    scene.setPaused(!scene.isPaused());
    showPaused();
  });
  showPaused();

  // --- Momento -------------------------------------------------------------

  const showHour = () => {
    const text = formatTime(Number(hour.value));
    hourOutput.textContent = text;
    hour.setAttribute('aria-valuetext', text);
  };

  const fillFrom = (date: Date) => {
    hour.value = String(minutesOf(date));
    month.value = String(date.getMonth());
    showHour();
  };

  const selectWeather = (kind: WeatherKind) => {
    for (const input of weatherInputs) input.checked = input.value === kind;
  };

  const applyChosenMoment = () => {
    const minutes = Number(hour.value);
    const date = new Date(new Date().getFullYear(), Number(month.value), MID_MONTH_DAY, Math.floor(minutes / 60), minutes % 60);
    scene.setMoment(date);
    showHour();
  };

  hour.addEventListener('input', applyChosenMoment);
  month.addEventListener('change', applyChosenMoment);
  for (const input of weatherInputs) {
    input.addEventListener('change', () => {
      if (input.checked) scene.setWeather(input.value as WeatherKind);
    });
  }

  reset.addEventListener('click', () => {
    scene.setMoment(null);
    scene.setWeather('live');
    fillFrom(new Date());
    selectWeather('live');
  });

  fillFrom(initial.moment ?? new Date());
  selectWeather(initial.weather);

  // --- Panel desplegable ---------------------------------------------------

  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open) hour.focus();
    else if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false, true);
  });
  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Node;
    if (!panel.hidden && !panel.contains(target) && !toggle.contains(target)) setOpen(false);
  });
}
