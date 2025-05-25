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
  id: string; // Añadir el ID para el patrón recurrente
  comercio: string;
  giro_comercio?: string; // Opcional
  estimated_monto: number; // El monto base que se repite
  estimated_interval_days: number;
  first_occurrence_date: string; // La primera fecha de la transacción en los datos de entrada
  last_occurrence_date: string; // La última fecha real de la transacción en los datos de entrada
  num_occurrences: number; // Número de ocurrencias en los datos
  avg_reconstruction_error_in_group: number; // Error de reconstrucción
  proximas_predicciones?: MonthlyPrediction[]; // Opcional, si quieres generarlas en el frontend
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
  isLoading: boolean = true;
  currentClientFileName: string | undefined = 'Archivo Desconocido';
  noPatternsMessage: string | undefined = undefined;

  constructor(private router: Router) {
    // Recupera el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as { predictedPatterns: RecurringPatternPrediction[], clientFileName: string, message?: string };
      this.predictedPatterns = state.predictedPatterns || [];
      this.currentClientFileName = state.clientFileName || 'Archivo Desconocido';
      this.noPatternsMessage = state.message; // Captura el mensaje si no hay patrones
    }
  }

  ngOnInit(): void {
    // Simulate loading for a moment, then display results
    setTimeout(() => {
      this.isLoading = false;
      // Generar próximas predicciones en el frontend si es necesario
      this.predictedPatterns.forEach(pattern => {
        if (pattern.estimated_interval_days > 0) {
          pattern.proximas_predicciones = this.calculateNextPredictions(
            new Date(pattern.last_occurrence_date),
            pattern.estimated_monto,
            pattern.estimated_interval_days,
            3 // Generar 3 predicciones futuras
          );
        }
      });
    }, 1000); // Pequeño retraso para que el usuario vea el "cargando"
  }

  goBack(): void {
    this.router.navigate(['/']); // Navega de vuelta a la página de carga de archivos
  }

  // Helper para calcular las próximas predicciones basadas en el intervalo y el monto estimado
  private calculateNextPredictions(lastDate: Date, estimatedAmount: number, intervalDays: number, count: number): MonthlyPrediction[] {
    const predictions: MonthlyPrediction[] = [];
    let currentDate = new Date(lastDate);

    for (let i = 0; i < count; i++) {
      currentDate.setDate(currentDate.getDate() + intervalDays);
      predictions.push({
        fecha_predicha: new Date(currentDate).toISOString().split('T')[0],
        monto_estimado: parseFloat(estimatedAmount.toFixed(2)) // Usar el monto estimado directamente
      });
    }
    return predictions;
  }
}