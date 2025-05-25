import { Component, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrencyPipe, DecimalPipe } from '@angular/common';


// Interfaz para una única predicción de fecha/monto
interface MonthlyPrediction {
  fecha_predicha: string; // o Date
  monto_estimado: number;
}

// Interfaz para un patrón de gasto recurrente
interface RecurringPatternPrediction {
  comercio: string;
  giro_comercio?: string; // Opcional
  monto_base_estimado: number; // El monto base que se repite
  intervalo_dias_estimado: number;
  ultima_fecha_real?: string; // La última fecha real de la transacción en los datos de entrada
  proximas_predicciones: MonthlyPrediction[];
  confianza?: number;
  num_ocurrencias_previas?: number;
}

@Component({
  selector: 'app-results-viewer',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, DecimalPipe],
  templateUrl: './results-viewer.component.html',
  styleUrl: './results-viewer.component.css'
})
export class ResultsViewerComponent implements OnInit {
  predictedPatterns: RecurringPatternPrediction[] = [];
  isLoading: boolean = true; // Para simular carga
  currentClientFileName: string | undefined = 'Archivo Desconocido'; // Ejemplo

  constructor(private router: Router) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.predictedPatterns = (navigation.extras.state['predictions'] as RecurringPatternPrediction[]) || [];
      this.currentClientFileName = navigation.extras.state['fileName'] as string || 'Archivo Desconocido';
    }
  }

  ngOnInit(): void {
    if (!this.predictedPatterns || this.predictedPatterns.length === 0) {
      console.warn('No se recibieron predicciones o nombre de archivo en el estado de la ruta.');
    }

    // Simular un tiempo de carga para los datos
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
     if (!this.predictedPatterns || this.predictedPatterns.length === 0) {
       this.generateDummyPredictions();
     }
  }

  private generateDummyPredictions(): void {
    // Fecha base para las predicciones (hoy)
    const today = new Date(); // Usaremos May 25, 2025 como referencia por el timestamp actual
    // const today = new Date(2025, 4, 25); // Mayo es el mes 4 (0-indexed)


    this.predictedPatterns = [
      {
        comercio: 'NETFLIX',
        giro_comercio: 'SUSCRIPCIONES DIGITALES',
        monto_base_estimado: 149.00,
        intervalo_dias_estimado: 30,
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().split('T')[0], // ej. el 18 del mes actual
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth(), 18), 149.00, 30, 3),
        confianza: 0.95, // Ejemplo de confianza
        num_ocurrencias_previas: 12
      },
      {
        comercio: 'SPOTIFY',
        giro_comercio: 'MUSICA DIGITAL',
        monto_base_estimado: 115.00,
        intervalo_dias_estimado: 30,
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth(), 22).toISOString().split('T')[0],
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth(), 22), 115.00, 30, 3),
        confianza: 0.92,
        num_ocurrencias_previas: 20
      },
      {
        comercio: 'GYMCIELO',
        giro_comercio: 'GIMNASIOS',
        monto_base_estimado: 550.00,
        intervalo_dias_estimado: 30,
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth(), 1), 550.00, 30, 3),
        confianza: 0.88,
        num_ocurrencias_previas: 8
      },
      {
        comercio: 'CFE LUZ',
        giro_comercio: 'PAGO DE SERVICIOS',
        monto_base_estimado: 420.50, // El monto puede variar, este es un estimado base
        intervalo_dias_estimado: 60, // Bimestral
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth() -1, 5).toISOString().split('T')[0], // ej. el 5 del mes pasado
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth() - 1, 5), 420.50, 60, 3, true), // true para monto variable
        confianza: 0.85,
        num_ocurrencias_previas: 6
      }
    ];
  }

  private calculateNextMonthsForDummy(lastDate: Date, baseAmount: number, intervalDays: number, count: number, variableAmount: boolean = false): MonthlyPrediction[] {
    const predictions: MonthlyPrediction[] = [];
    let currentDate = new Date(lastDate);

    for (let i = 0; i < count; i++) {
      currentDate.setDate(currentDate.getDate() + intervalDays);
      let predictedAmount = baseAmount;
      if (variableAmount) {
        predictedAmount = baseAmount * (1 + (Math.random() - 0.5) * 0.1);
      }
      predictions.push({
        fecha_predicha: new Date(currentDate).toISOString().split('T')[0],
        monto_estimado: parseFloat(predictedAmount.toFixed(2))
      });
    }
    return predictions;
  }
   goBack(): void {
    this.router.navigate(['/']);
  }

  getConfidenceColor(confidence?: number): string {
    if (confidence === undefined) return '#FFFFFF';
    if (confidence >= 0.9) return 'var(--hey-green-accent)';
    if (confidence >= 0.8) return '#FFD700';
    return '#FF6347';
  }
}
