import { Component, inject } from '@angular/core';
import { Index as Navbar } from "./layout/navbar/index/index";
import { RouterOutlet } from '@angular/router';
import { Index as Toast } from './layout/toast/index/index';
import { LoaderService } from './shared/utils/loader.service';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App {
  loaderService = inject(LoaderService);
}
