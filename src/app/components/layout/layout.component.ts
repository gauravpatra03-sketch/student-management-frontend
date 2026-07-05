import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  @ViewChild('drawer') drawer!: MatSidenav;

  isDarkMode = false;
  username = 'Admin';
  isMobile = false;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Retrieve logged in user's username
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username = savedUsername;
    }

    // Retrieve saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.body.classList.remove('dark-theme');
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.isDarkMode = true;
        document.body.classList.add('dark-theme');
      }
    }

    // Watch for screen size changes
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isMobile = result.matches;
        if (this.isMobile && this.drawer) {
          this.drawer.mode = 'over';
          this.drawer.close();
        } else if (this.drawer) {
          this.drawer.mode = 'side';
          this.drawer.open();
        }
      });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  logout(): void {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    document.body.classList.remove('dark-theme'); // clear theme class on logout
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.drawer.toggle();
  }

}