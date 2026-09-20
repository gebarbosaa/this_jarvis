export function todayISODate(): string {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDiaCompleto(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}

/** Segunda-feira da semana que contém `dateISO` (ou hoje, se omitido). */
export function inicioDaSemana(dateISO: string = todayISODate()): Date {
  const d = new Date(`${dateISO}T00:00:00`);
  const diaSemana = d.getDay(); // 0 = domingo
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + offset);
  return d;
}

export function diasDaSemana(dateISO: string = todayISODate()): Date[] {
  const inicio = inicioDaSemana(dateISO);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });
}

export function formatDiaCurto(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).replace('.', '');
}