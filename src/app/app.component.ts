import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FileUploaderComponent} from './file-uploader/file-uploader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FileUploaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PrediccionTransacciones';
  currentYear = new Date().getFullYear();
}
