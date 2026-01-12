import { Component, inject, signal } from '@angular/core';
import { Menu } from "../menu/menu";
import { Auth } from '../auth/auth';
import { Bubble } from "../bubble/bubble";
import { LastRouteService } from '../../../services/last-route';
import { navId } from '../../navbar.config';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [Menu, Auth, Bubble],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class Index {
  lastRouteService = inject(LastRouteService);
  
  private _selectedId = new BehaviorSubject<navId>(null);
  selectedId = this._selectedId.asObservable();

  onSelect(id: navId) {
    this._selectedId.next(id);

    if (id === "nav-auth") {
      this.lastRouteService.updateLastRoute();
    }
  }
}
