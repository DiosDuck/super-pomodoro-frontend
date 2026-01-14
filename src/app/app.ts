import { Component, inject, OnInit } from '@angular/core';
import { Index as Navbar } from "./shared/components/navbar/index/index";
import { RouterOutlet } from '@angular/router';
import { Index as Toast } from './shared/components/toast/index';
import { LoaderService } from './shared/services/loader';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App implements OnInit {
  sprite!: SafeHtml;

  loaderService = inject(LoaderService);
  private _http = inject(HttpClient);
  private _sanitizer = inject(DomSanitizer);

  async ngOnInit(): Promise<void> {
    const rawSvg = await firstValueFrom(
      this._http.get('assets/icons/sprite.svg', { responseType: 'text' })
    );

    this.sprite = this._sanitizer.bypassSecurityTrustHtml(rawSvg);
  }
}
