import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpClient y HttpHeaders
import { lastValueFrom } from 'rxjs'; // Para usar async/await con HttpClient

// Definimos aquí la interfaz para los datos de ejemplo que pasaremos
interface MonthlyPrediction {
  fecha_predicha: string;
  monto_estimado: number;
}
interface RecurringPatternPrediction {
  id: string; // Añadir el ID para el patrón recurrente
  comercio: string;
  giro_comercio?: string;
  estimated_monto: number; // Corregido según la salida de Flask
  estimated_interval_days: number; // Corregido según la salida de Flask
  first_occurrence_date: string; // Corregido según la salida de Flask
  last_occurrence_date: string; // Corregido según la salida de Flask
  num_occurrences: number; // Corregido según la salida de Flask
  avg_reconstruction_error_in_group: number; // Corregido según la salida de Flask
  proximas_predicciones?: MonthlyPrediction[]; // Opcional, si quieres generarlas en el frontend
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

  // URL de tu API Flask
  private FLASK_API_URL = 'http://localhost:3000/predict_recurrent'; // Asegúrate de que este sea el puerto correcto de tu Flask

  constructor(private router: Router, private http: HttpClient) {} // Inyecta HttpClient

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.feedbackMessage = `Archivo seleccionado: ${this.selectedFile.name}`;
      this.isError = false;
    } else {
      this.selectedFile = null;
      this.feedbackMessage = "Por favor, selecciona un archivo CSV.";
      this.isError = true;
    }
  }

  async triggerUploadAndNavigate(): Promise<void> {
    if (!this.selectedFile) {
      this.feedbackMessage = "Por favor, selecciona un archivo primero para analizar.";
      this.isError = true;
      return;
    }

    this.isLoading = true;
    this.feedbackMessage = `Analizando transacciones de ${this.selectedFile.name}...`;
    this.isError = false;

    try {
      const fileContent = await this.readFileContent(this.selectedFile);

      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = {
        transactions_csv: fileContent
      };

      // Realiza la solicitud POST a tu API Flask
      const response: any = await lastValueFrom(
        this.http.post(this.FLASK_API_URL, body, { headers: headers })
      );

      this.isLoading = false;

      if (response && response.status === 'success' && response.recurrent_patterns) {
        this.feedbackMessage = "¡Análisis completado! Patrones identificados.";
        // Navega al componente de resultados y pasa los patrones identificados
        this.router.navigate(['/results'], { state: { predictedPatterns: response.recurrent_patterns, clientFileName: this.selectedFile.name } });
      } else if (response && response.status === 'success' && response.message) {
        this.feedbackMessage = response.message; // "No recurrent patterns identified."
        this.router.navigate(['/results'], { state: { predictedPatterns: [], clientFileName: this.selectedFile.name, message: response.message } });
      } else {
        this.isError = true;
        this.feedbackMessage = response.error || "Error desconocido al procesar el archivo.";
      }

    } catch (error: any) {
      this.isLoading = false;
      this.isError = true;
      console.error("Error al subir o procesar el archivo:", error);
      this.feedbackMessage = `Error al conectar con el servidor o procesar: ${error.message || 'Error desconocido'}`;
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (e) => {
        reject(new Error("Error al leer el archivo."));
      };
      reader.readAsText(file);
    });
  }
}