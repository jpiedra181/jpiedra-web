// Sonido opcional de la escena, generado en el navegador con Web Audio: no se
// descarga ningún archivo y nunca suena hasta que la persona lo activa
// (WCAG 1.4.2). El ambiente sigue al tiempo real: viento, lluvia y, en las
// noches templadas, grillos.

const MASTER_VOLUME = 0.55;
const FADE_SECONDS = 0.8;
const NOISE_SECONDS = 2;

// Viento: ruido marrón filtrado. Aunque esté en calma queda un aire de fondo.
const WIND_BASE_GAIN = 0.05;
const WIND_GAIN_RANGE = 0.32;
const WIND_BASE_CUTOFF_HZ = 380;
const WIND_CUTOFF_RANGE_HZ = 900;
const WIND_GUST_HZ = 0.09;

// Lluvia: ruido blanco con el grave recortado.
const RAIN_GAIN_RANGE = 0.3;
const RAIN_HIGHPASS_HZ = 900;
const SNOW_MUFFLE_CUTOFF_HZ = 260;

// Grillos: solo de noche y con más de 12 °C, como en la sierra de verdad.
const CRICKET_MIN_TEMPERATURE = 12;
const CRICKET_FREQUENCY_HZ = 4300;
const CRICKET_GAIN = 0.018;
const CRICKET_INTERVAL_MS = 1400;

// La nota de cada vértice depende de su altitud: dos octavas entre el llano
// (900 m) y Peñalara.
const PING_BASE_HZ = 196;
const PING_MIN_ALTITUDE = 900;
const PING_ALTITUDE_PER_OCTAVE = 760;
const PING_GAIN = 0.07;

export interface SoundConditions {
  wind: number;
  rain: number;
  snow: number;
  night: number;
  temperature: number;
}

export interface Soundscape {
  setEnabled(enabled: boolean): Promise<void>;
  isEnabled(): boolean;
  update(conditions: SoundConditions): void;
  ping(altitudeMetres: number): void;
  whoosh(seconds: number): void;
  // Fin del mundo: el rugido que se acerca y el golpe del impacto.
  meteor(seconds: number): void;
  impact(): void;
  dispose(): void;
}

function createNoiseBuffer(context: AudioContext, brown: boolean): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * NOISE_SECONDS, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      // Ruido marrón: integra el blanco; suena a viento, no a interferencia.
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

export function createSoundscape(): Soundscape {
  let context: AudioContext | null = null;
  let master: GainNode;
  let windGain: GainNode;
  let windFilter: BiquadFilterNode;
  let rainGain: GainNode;
  let rainFilter: BiquadFilterNode;
  let whiteNoise: AudioBuffer;
  let enabled = false;
  let conditions: SoundConditions = { wind: 0, rain: 0, snow: 0, night: 0, temperature: 15 };
  let cricketTimer = 0;

  const loopNoise = (buffer: AudioBuffer, destination: AudioNode) => {
    const source = context!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(destination);
    source.start();
  };

  const build = () => {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    whiteNoise = createNoiseBuffer(context, false);

    windFilter = context.createBiquadFilter();
    windFilter.type = 'lowpass';
    windGain = context.createGain();
    windFilter.connect(windGain).connect(master);
    loopNoise(createNoiseBuffer(context, true), windFilter);

    // Rachas: un oscilador muy lento mueve el volumen del viento.
    const gust = context.createOscillator();
    gust.frequency.value = WIND_GUST_HZ;
    const gustDepth = context.createGain();
    gustDepth.gain.value = 0.04;
    gust.connect(gustDepth).connect(windGain.gain);
    gust.start();

    rainFilter = context.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = RAIN_HIGHPASS_HZ;
    rainGain = context.createGain();
    rainFilter.connect(rainGain).connect(master);
    loopNoise(whiteNoise, rainFilter);
  };

  const applyConditions = () => {
    if (!context) return;
    const now = context.currentTime;
    const { wind, rain, snow } = conditions;
    // La nieve amortigua: el ambiente se vuelve sordo.
    const cutoff = snow > 0 ? SNOW_MUFFLE_CUTOFF_HZ : WIND_BASE_CUTOFF_HZ + wind * WIND_CUTOFF_RANGE_HZ;
    windFilter.frequency.setTargetAtTime(cutoff, now, 1.5);
    windGain.gain.setTargetAtTime(WIND_BASE_GAIN + wind * WIND_GAIN_RANGE, now, 1.5);
    rainGain.gain.setTargetAtTime(rain * RAIN_GAIN_RANGE, now, 1.5);
  };

  const chirp = () => {
    if (!context || !enabled) return;
    const { night, temperature, rain } = conditions;
    if (night < 0.8 || temperature < CRICKET_MIN_TEMPERATURE || rain > 0) return;
    const start = context.currentTime + Math.random() * 0.4;
    for (let pulse = 0; pulse < 3; pulse++) {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = CRICKET_FREQUENCY_HZ + Math.random() * 200;
      const envelope = context.createGain();
      const at = start + pulse * 0.07;
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(CRICKET_GAIN, at + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
      oscillator.connect(envelope).connect(master);
      oscillator.start(at);
      oscillator.stop(at + 0.06);
    }
  };

  // Al ocultar la pestaña se suspende: nada suena ni gasta batería en segundo plano.
  const onVisibility = () => {
    if (!context) return;
    if (document.hidden) context.suspend();
    else if (enabled) context.resume();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    async setEnabled(next) {
      enabled = next;
      // En iPhone, el audio web respeta el interruptor de silencio salvo que
      // se declare como reproducción. Solo se hace cuando la persona pide el
      // sonido, igual que al darle al play de un vídeo.
      const audioSession = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
      if (next && audioSession) audioSession.type = 'playback';
      if (next && !context) build();
      if (!context) return;
      if (next) await context.resume();
      applyConditions();
      master.gain.setTargetAtTime(next ? MASTER_VOLUME : 0, context.currentTime, FADE_SECONDS / 3);
      window.clearInterval(cricketTimer);
      if (next) cricketTimer = window.setInterval(chirp, CRICKET_INTERVAL_MS);
    },
    isEnabled() {
      return enabled;
    },
    update(next) {
      conditions = next;
      applyConditions();
    },
    ping(altitudeMetres) {
      if (!context || !enabled) return;
      const now = context.currentTime;
      const octaves = Math.max(0, (altitudeMetres - PING_MIN_ALTITUDE) / PING_ALTITUDE_PER_OCTAVE);
      const frequency = PING_BASE_HZ * 2 ** octaves;
      for (const [multiple, level] of [[1, 1], [2, 0.3]] as const) {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency * multiple;
        const envelope = context.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(PING_GAIN * level, now + 0.015);
        envelope.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        oscillator.connect(envelope).connect(master);
        oscillator.start(now);
        oscillator.stop(now + 1.7);
      }
    },
    whoosh(seconds) {
      if (!context || !enabled) return;
      const now = context.currentTime;
      const source = context.createBufferSource();
      source.buffer = whiteNoise;
      source.loop = true;
      const band = context.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 1.2;
      band.frequency.setValueAtTime(300, now);
      band.frequency.exponentialRampToValueAtTime(2200, now + seconds * 0.7);
      band.frequency.exponentialRampToValueAtTime(600, now + seconds);
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(0.18, now + seconds * 0.6);
      envelope.gain.linearRampToValueAtTime(0, now + seconds);
      source.connect(band).connect(envelope).connect(master);
      source.start(now);
      source.stop(now + seconds + 0.1);
    },
    meteor(seconds) {
      if (!context || !enabled) return;
      const now = context.currentTime;
      const source = context.createBufferSource();
      source.buffer = whiteNoise;
      source.loop = true;
      const roar = context.createBiquadFilter();
      roar.type = 'lowpass';
      roar.frequency.setValueAtTime(160, now);
      roar.frequency.exponentialRampToValueAtTime(1800, now + seconds);
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(0.32, now + seconds);
      envelope.gain.linearRampToValueAtTime(0, now + seconds + 0.08);
      source.connect(roar).connect(envelope).connect(master);
      source.start(now);
      source.stop(now + seconds + 0.1);
      // El silbido que baja de tono, como en las películas.
      const whistle = context.createOscillator();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(1300, now);
      whistle.frequency.exponentialRampToValueAtTime(220, now + seconds);
      const whistleGain = context.createGain();
      whistleGain.gain.setValueAtTime(0, now);
      whistleGain.gain.linearRampToValueAtTime(0.035, now + seconds * 0.7);
      whistleGain.gain.linearRampToValueAtTime(0, now + seconds);
      whistle.connect(whistleGain).connect(master);
      whistle.start(now);
      whistle.stop(now + seconds + 0.05);
    },
    impact() {
      if (!context || !enabled) return;
      const now = context.currentTime;
      const source = context.createBufferSource();
      source.buffer = whiteNoise;
      source.loop = true;
      const rumble = context.createBiquadFilter();
      rumble.type = 'lowpass';
      rumble.frequency.setValueAtTime(1400, now);
      rumble.frequency.exponentialRampToValueAtTime(90, now + 2.6);
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(0.75, now);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 3);
      source.connect(rumble).connect(envelope).connect(master);
      source.start(now);
      source.stop(now + 3.1);
      const sub = context.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(62, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 2);
      const subGain = context.createGain();
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
      sub.connect(subGain).connect(master);
      sub.start(now);
      sub.stop(now + 2.5);
    },
    dispose() {
      window.clearInterval(cricketTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      context?.close();
    },
  };
}
