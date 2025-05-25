import { Routes } from '@angular/router';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { ResultsViewerComponent } from './results-viewer/results-viewer.component';

export const routes: Routes = [
  { path: '', component: FileUploaderComponent },
  { path: 'results', component: ResultsViewerComponent },
  { path: '**', redirectTo: '' } // Redirigir a la página principal si la ruta no existe
];