import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PriceTrendService, IntuitionMarketGapData } from '../price-trend/price-trend.service';
import { Subscription } from 'rxjs';

interface MarketOption {
  id: string;
  name: string;
  fierceIntuition: number; // Percentage from community votes
  marketPrice: number; // Real market percentage
  volume: string; // Trading volume
  gap: number;
}

interface PredictionData {
  type: 'binary' | 'multiple'; // Binary: Yes/No, Multiple: Several options
  options: MarketOption[];
}

@Component({
  selector: 'app-intuition-vs-market-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intuition-vs-market-analysis.component.html',
  styleUrl: './intuition-vs-market-analysis.component.scss',
})
export class IntuitionVsMarketAnalysisComponent implements OnInit, OnDestroy {
  @Input() predictionTitle: string = '';
  predictionData: PredictionData | null = null;
  showInfoPopover = false;
  isAnalysisExpanded = true;
  private routeSub: Subscription | null = null;
  private dataSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private priceTrendService: PriceTrendService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const predictionId = params['id'];
      if (predictionId) {
        this.loadData(predictionId);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  private loadData(predictionId: number) {
    this.dataSub = this.priceTrendService.getIntuitionMarketGap(predictionId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.mapData(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading intuition market gap data:', error);
      }
    });
  }

  private mapData(apiData: IntuitionMarketGapData[]) {
    const options: MarketOption[] = apiData.map(item => ({
      id: item.prediction_option_id.toString(),
      name: item.prediction_option_title,
      fierceIntuition: Math.round(item.intuition_percentage),
      marketPrice: Math.round(item.market_percentage * 100),
      volume: this.formatVolume(item.option_amount_usdt),
      gap: Math.round(item.gap)
    }));

    const isBinary = options.length === 2 && 
      (options.some(o => o.name.toUpperCase() === 'SÍ' || o.name.toUpperCase() === 'YES') ||
       options.some(o => o.name.toUpperCase() === 'NO'));

    this.predictionData = {
      type: isBinary ? 'binary' : 'multiple',
      options: options
    };
  }

  private formatVolume(amount: number): string {
    if (!amount) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(amount)}`;
  }

  toggleInfoPopover() {
    this.showInfoPopover = !this.showInfoPopover;
  }

  closeInfoPopover() {
    this.showInfoPopover = false;
  }

  toggleAnalysis() {
    this.isAnalysisExpanded = !this.isAnalysisExpanded;
  }

  getOptionAnalysis(option: MarketOption): any {
    const gap = option.gap;
    let title = '';
    let message = '';
    let type: 'positive' | 'negative' | 'neutral' = 'neutral';
    let hint = '';

    if (gap >= 30) {
      title = `🔵 ${option.name.toUpperCase()} (GAP +${gap}%)`;
      message = `La comunidad (${option.fierceIntuition}%) es significativamente más optimista que el mercado (${option.marketPrice}%).`;
      hint = `📌 Oportunidad: Si crees que el mercado eventualmente subirá para alcanzar la intuición, podrías comprar antes de que otros reaccionen.`;
      type = 'positive';
    } else if (gap <= -30) {
      title = `🟢 ${option.name.toUpperCase()} (GAP ${gap}%)`;
      message = `El mercado (${option.marketPrice}%) confía mucho más en esta opción que la comunidad (${option.fierceIntuition}%).`;
      hint = `📌 Oportunidad inversa: El dinero ("smart money") ve valor real aquí. Podría ser una oportunidad de compra antes de que la comunidad lo descubra.`;
      type = 'negative';
    } else if (gap > -10 && gap < 10) {
      title = `⚪ ${option.name.toUpperCase()} (GAP ${gap >= 0 ? '+' : ''}${gap}%)`;
      message = `La comunidad (${option.fierceIntuition}%) y el mercado (${option.marketPrice}%) están alineados.`;
      hint = `📌 Neutral: La señal es clara y aceptada por todos. No hay discrepancias significativas para arbitraje.`;
      type = 'neutral';
    } else {
      // Intermediate cases
      title = `🟡 ${option.name.toUpperCase()} (GAP ${gap >= 0 ? '+' : ''}${gap}%)`;
      message = `Existe una discrepancia moderada entre la opinión (${option.fierceIntuition}%) y el precio real (${option.marketPrice}%).`;
      hint = `📌 Observación: Monitorea si la tendencia de votos cambia o si el volumen empieza a subir.`;
      type = gap > 0 ? 'positive' : 'negative';
    }

    return { title, message, hint, type };
  }

  copyAIPrompt() {
    if (!this.predictionData) return;

    let tableData = '| Opción | Intuición | Mercado | GAP |\n| :--- | :--- | :--- | :--- |\n';
    this.predictionData.options.forEach(opt => {
      tableData += `| ${opt.name} | ${opt.fierceIntuition}% | ${opt.marketPrice}% | ${opt.gap >= 0 ? '+' : ''}${opt.gap}% |\n`;
    });

    const prompt = `📊 ANÁLISIS DE PREDICCIÓN EN PLATAFORMA DE MERCADOS

🎯 Título de la predicción:
${this.predictionTitle || 'Predicción actual'}

📌 CONTEXTO:
- Intuición Fierce = % de votos populares de la comunidad (holders)
- Mercado Real = % de probabilidad según el dinero apostado (precio)
- GAP = Intuición - Mercado (diferencia)
  - GAP positivo (+): la comunidad cree más que el dinero
  - GAP negativo (-): el dinero cree más que la comunidad
  - GAP grande (>30% o <-30%) puede indicar oportunidades

📊 DATOS DE LA PREDICCIÓN:

${tableData}

🔍 INSTRUCCIONES PARA EL ANÁLISIS:

Genera un análisis para cada opción que incluya:

1️⃣ PARA PRINCIPIANTES (lenguaje simple, enfoque en qué significa y qué hacer)
2️⃣ PARA AVANZADOS (términos de trading, oportunidades de arbitraje, señales)
3️⃣ CONCLUSIÓN GENERAL (una frase que resuma el estado actual de la predicción)

Usa los GAPs para identificar posibles oportunidades o riesgos. Aplica la lógica de que los GAPs grandes tienden a converger con el tiempo.`;

    navigator.clipboard.writeText(prompt).then(() => {
      // You could add a temporary toast or change button text here
      console.log('Prompt copiado al portapapeles');
      alert('Prompt copiado al portapapeles con éxito');
    });
  }

  getGap(option: MarketOption): number {
    return option.gap;
  }

  getBarWidth(value: number): string {
    return `${value}%`;
  }

  Math = Math;
}
