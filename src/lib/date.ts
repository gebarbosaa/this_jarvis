const TIME_ZONE = 'America/Sao_Paulo';

export function todayISODate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function toISODate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatDiaCompleto(dateISO: string): string {
  const d = new Date(`${dateISO}T12:00:00-03:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}

/** Cria uma data no início do dia em São Paulo, sem depender do fuso do servidor. */
export function dateAtSaoPauloMidnight(dateISO: string): Date {
  return new Date(`${dateISO}T00:00:00-03:00`);
}

/** Segunda-feira da semana que contém dateISO, calculada como calendário de São Paulo. */
export function inicioDaSemana(dateISO: string = todayISODate()): Date {
  const [year, month, day] = dateISO.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const diaSemana = d.getUTCDay();
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}

export function diasDaSemana(dateISO: string = todayISODate()): Date[] {
  const inicio = inicioDaSemana(dateISO);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setUTCDate(inicio.getUTCDate() + i);
    return d;
  });
}

export function formatDiaCurto(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(d).replace('.', '');
}
