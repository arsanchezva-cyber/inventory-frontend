import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend-inventory-app';
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    });
  }
}