import { Component, inject } from '@angular/core';
import { Index as Navbar } from "./shared/components/navbar/index/index";
import { RouterOutlet } from '@angular/router';
import { Index as Toast } from './shared/components/toast/index';
import { LoaderService } from './shared/services/loader';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App {
  loaderService = inject(LoaderService);
}
