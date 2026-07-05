import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Dashboard } from 'src/app/models/dashboard';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { ChartConfiguration, ChartType } from 'chart.js';

import { CourseStatistics } from 'src/app/models/course-statistics';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [

    trigger('fade', [
      transition(':enter', [

        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),

        animate(
          '500ms ease',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )

      ])

    ])
  ]

})
export class DashboardComponent implements OnInit {

  greeting = '';
  username = 'Admin';

  currentDate = new Date();

  dashboard: Dashboard = {
    totalStudents: 0,
    totalCourses: 0,
    totalMale: 0,
    totalFemale: 0
  };

  displayStudents = 0;
  displayCourses = 0;
  displayMale = 0;
  displayFemale = 0;

  animateValue(
    property: 'displayStudents' | 'displayCourses' | 'displayMale' | 'displayFemale',
    target: number
  ): void {

    let current = 0;

    const interval = setInterval(() => {

      current++;

      this[property] = current;

      if (current >= target) {

        clearInterval(interval);

      }

    }, 40);

  }

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  public pieChartType: 'doughnut' = 'doughnut';

  public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [0, 0]
      }
    ]
  };

  public pieChartLegend = true;

  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  public barChartType: 'bar' = 'bar';

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Students',
        data: []
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  ngOnInit(): void {

    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username = savedUsername;
    }

    this.loadDashboard();

    this.loadCourseStatistics();

    this.updateGreeting();

    setInterval(() => {

      this.currentDate = new Date();

    }, 1000);

  }

  updateGreeting() {

    const hour = new Date().getHours();

    if (hour < 12) {

      this.greeting = 'Good Morning';

    }

    else if (hour < 17) {

      this.greeting = 'Good Afternoon';

    }

    else {

      this.greeting = 'Good Evening';

    }

  }

  loadDashboard() {

    this.dashboardService.getDashboardData().subscribe({

      next: (response: Dashboard) => {

        console.log('Dashboard Response:', response);

        this.dashboard = response;

        this.pieChartData = {
          labels: ['Male', 'Female'],
          datasets: [
            {
              data: [
                response.totalMale,
                response.totalFemale
              ]
            }
          ]
        };

        this.animateValue('displayStudents', response.totalStudents);

        this.animateValue('displayCourses', response.totalCourses);

        this.animateValue('displayMale', response.totalMale);

        this.animateValue('displayFemale', response.totalFemale);

      },

      error: (error: any) => {

        console.log(error);

      }

    });

  }

  logout() {

    localStorage.removeItem('loggedIn');

    this.router.navigate(['/login']);

  }

  refreshDashboard(): void {
    this.loadDashboard();
    this.loadCourseStatistics();
  }

  loadCourseStatistics() {

    this.dashboardService.getCourseStatistics().subscribe({

      next: (response: CourseStatistics[]) => {

        this.barChartData = {

          labels: response.map(item => item.course),

          datasets: [
            {
              label: 'Students',
              data: response.map(item => item.total)
            }
          ]

        };

      },

      error: (error: any) => {

        console.log(error);

      }

    });

  }

}