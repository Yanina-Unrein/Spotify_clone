import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-greeting',
  imports: [],
  templateUrl: './greeting.component.html',
  styleUrl: './greeting.component.css'
})
export class GreetingComponent implements OnInit {
  greeting: string = '';

  ngOnInit(): void {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    if (currentHour < 13) {
      this.greeting = 'Buenos días';
    } else if (currentHour < 19) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }
}