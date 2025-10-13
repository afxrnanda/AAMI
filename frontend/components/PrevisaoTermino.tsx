import React from 'react';

interface Props {
  pesoInicial?: number;
  pesoAtual?: number;
  inicioMedicacao?: string;
}

export default function PrevisaoTermino({ pesoInicial, pesoAtual, inicioMedicacao }: Props) {
  // Verificações básicas
  if (!pesoInicial || !pesoAtual || !inicioMedicacao) {
    return <>–</>; // mostra traço se faltar dado
  }

  const inicio = new Date(inicioMedicacao);
  if (isNaN(inicio.getTime())) return <>–</>;

  const tempoDecorrido = Date.now() - inicio.getTime();
  if (tempoDecorrido <= 0) return <>–</>;

  const pesoConsumido = pesoInicial - pesoAtual;
  if (pesoConsumido <= 0) return <>Calculando…</>;

  const taxaConsumo = pesoConsumido / tempoDecorrido;
  if (!isFinite(taxaConsumo) || taxaConsumo <= 0) return <>–</>;

  const tempoRestanteMs = pesoAtual / taxaConsumo;
  if (!isFinite(tempoRestanteMs) || tempoRestanteMs <= 0) return <>Finalizado</>;

  const previsao = new Date(Date.now() + tempoRestanteMs);

  const diff = previsao.getTime() - Date.now();
  if (diff <= 0) return <>Finalizado</>;
  if (diff > 24 * 60 * 60 * 1000) return <>Mais de 24h</>;

  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Formato: “2h 15min restantes” ou “45min restantes”
  const tempoFormatado =
    horas > 0 ? `${horas}h ${minutos}min restantes` : `${minutos}min restantes`;

  return <>{tempoFormatado}</>;
}
