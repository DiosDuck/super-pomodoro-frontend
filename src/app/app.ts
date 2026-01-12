import { Component } from '@angular/core';
import { Index as Navbar } from "./shared/components/navbar/index/index";
import { RouterOutlet } from '@angular/router';
import { Index as Toast } from './shared/components/toast/index';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App {
  protected title = 'frontend';
}
