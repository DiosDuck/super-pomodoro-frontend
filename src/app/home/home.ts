import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NAV_MENU_ITEMS } from '../shared/configs/nav-items';
import { LoggedInPipe } from '../shared/pipes/user.pipe';
import { NullableUser, UserService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LoggedInPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  private _userService = inject(UserService);
  user = signal<NullableUser>(null);
  navItems = NAV_MENU_ITEMS;

  ngOnInit(): void {
    this._userService.user.subscribe((user) => this.user.set(user));
  }
}
