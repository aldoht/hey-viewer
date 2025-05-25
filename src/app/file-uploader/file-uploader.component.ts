import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

// Definimos aquí la interfaz para los datos de ejemplo que pasaremos
interface MonthlyPrediction {
  fecha_predicha: string;
  monto_estimado: number;
}
interface RecurringPatternPrediction {
  comercio: string;
  giro_comercio?: string;
  monto_base_estimado: number;
  intervalo_dias_estimado: number;
  ultima_fecha_real?: string;
  proximas_predicciones: MonthlyPrediction[];
  confianza?: number;
  num_ocurrencias_previas?: number;
}

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.css'
})
export class FileUploaderComponent {
  selectedFile: File | null = null;
  isLoading: boolean = false;
  feedbackMessage: string | null = null;
  isError: boolean = false;

  constructor(private router: Router) {}

  // Dummy function para el evento change del input file
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Actualizar el texto del label para mostrar el nombre del archivo
      const fileNameDisplay = document.getElementById('file-name-display');
      if (fileNameDisplay) {
        fileNameDisplay.textContent = this.selectedFile.name;
      }
      this.feedbackMessage = "Archivo '" + this.selectedFile.name + "' listo para analizar.";
      this.isError = false;
    } else {
      this.selectedFile = null;
      const fileNameDisplay = document.getElementById('file-name-display');
      if (fileNameDisplay) {
        fileNameDisplay.textContent = 'Arrastra y suelta tu archivo .csv aquí o haz clic para seleccionar';
      }
    }
  }

  // Dummy function para el botón, solo para simular
  triggerUploadAndNavigate(): void {
    if (!this.selectedFile) {
      this.feedbackMessage = "Por favor, selecciona un archivo .csv primero.";
      this.isError = true;
      return;
    }

    this.isLoading = true;
    this.feedbackMessage = "Simulando análisis del archivo: " + this.selectedFile.name;
    this.isError = false;

    const today = new Date();

    const examplePredictions: RecurringPatternPrediction[] = [
      {
        comercio: 'NETFLIX (Prueba)',
        giro_comercio: 'STREAMING',
        monto_base_estimado: 149.00,
        intervalo_dias_estimado: 30,
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().split('T')[0],
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth(), 18), 149.00, 30, 3),
        confianza: 0.95,
        num_ocurrencias_previas: 12
      },
      {
        comercio: 'SPOTIFY (Prueba)',
        giro_comercio: 'MUSICA',
        monto_base_estimado: 115.00,
        intervalo_dias_estimado: 30,
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth(), 22).toISOString().split('T')[0],
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth(), 22), 115.00, 30, 3),
        confianza: 0.92,
        num_ocurrencias_previas: 20
      },
      {
        comercio: 'GYM PRUEBA',
        giro_comercio: 'SALUD Y FITNESS',
        monto_base_estimado: 550.00,
        intervalo_dias_estimado: 30,
        ultima_fecha_real: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        proximas_predicciones: this.calculateNextMonthsForDummy(new Date(today.getFullYear(), today.getMonth(), 1), 550.00, 30, 3),
        confianza: 0.88,
        num_ocurrencias_previas: 8
      }
    ];

    // Simular un pequeño retraso como si se estuviera procesando
    setTimeout(() => {
      this.isLoading = false;
      // Navegar a la página de resultados y pasar los datos de ejemplo
      this.router.navigate(['results'], { state: { predictions: examplePredictions, fileName: this.selectedFile?.name } });
    }, 1500); // Simula 1.5 segundos de carga

    /*if (this.selectedFile) {
      this.isLoading = true;
      this.feedbackMessage = "Procesando archivo: " + this.selectedFile.name;
      this.isError = false;
      console.log("Simulando subida y análisis...");
      // Aquí iría la lógica real de subida y luego navegación.
      // Por ahora, solo simulamos.
      setTimeout(() => {
        this.isLoading = false;
        this.feedbackMessage = "¡Análisis completado! (simulado)"; // Mensaje de éxito
        this.isError = false;
        // this.router.navigate(['/results'], { state: { predictions: ... } });
      }, 2500);
    } else {
      this.feedbackMessage = "Por favor, selecciona un archivo primero.";
      this.isError = true;
    }*/
  }

  // Helper function para generar las próximas fechas
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
}
