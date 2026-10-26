import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LeaderboardCountry {
  code: string;
  name: string;
  emissionsMt: number;
  share: number;
  perCapita: number;
  cleanPower?: number;
}

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss'
})
export class WorldMapComponent {
  @Input() selectedCountry: string | null = 'IND';
  @Output() countrySelect = new EventEmitter<string>();

  // Verified empirical country benchmarks (Climate TRACE + GCP consensus)
  topEmitters: LeaderboardCountry[] = [
    { code: 'CHN', name: 'China', emissionsMt: 17240.6, share: 29.9, perCapita: 8.9, cleanPower: 35.8 },
    { code: 'USA', name: 'United States', emissionsMt: 6613.4, share: 11.5, perCapita: 14.9, cleanPower: 42.5 },
    { code: 'IND', name: 'India', emissionsMt: 4165.4, share: 7.2, perCapita: 2.0, cleanPower: 23.5 },
    { code: 'RUS', name: 'Russia', emissionsMt: 2950.0, share: 5.1, perCapita: 11.8, cleanPower: 38.0 },
    { code: 'IDN', name: 'Indonesia', emissionsMt: 1420.0, share: 2.5, perCapita: 2.5, cleanPower: 19.0 },
    { code: 'BRA', name: 'Brazil', emissionsMt: 1310.0, share: 2.3, perCapita: 2.2, cleanPower: 88.0 },
    { code: 'JPN', name: 'Japan', emissionsMt: 1120.0, share: 1.9, perCapita: 8.5, cleanPower: 30.5 },
    { code: 'IRN', name: 'Iran', emissionsMt: 980.0, share: 1.7, perCapita: 8.1, cleanPower: 8.0 },
    { code: 'SAU', name: 'Saudi Arabia', emissionsMt: 890.0, share: 1.5, perCapita: 18.2, cleanPower: 2.0 },
    { code: 'DEU', name: 'Germany', emissionsMt: 720.0, share: 1.3, perCapita: 8.0, cleanPower: 58.0 },
    { code: 'CAN', name: 'Canada', emissionsMt: 680.0, share: 1.2, perCapita: 14.2, cleanPower: 82.5 },
    { code: 'KOR', name: 'South Korea', emissionsMt: 650.0, share: 1.1, perCapita: 11.6, cleanPower: 32.0 },
    { code: 'MEX', name: 'Mexico', emissionsMt: 610.0, share: 1.1, perCapita: 3.5, cleanPower: 25.0 },
    { code: 'ZAF', name: 'South Africa', emissionsMt: 510.0, share: 0.9, perCapita: 6.9, cleanPower: 12.0 },
    { code: 'AUS', name: 'Australia', emissionsMt: 495.0, share: 0.9, perCapita: 14.5, cleanPower: 38.0 },
  ];

  onSelect(code: string) {
    this.countrySelect.emit(code);
  }
}
