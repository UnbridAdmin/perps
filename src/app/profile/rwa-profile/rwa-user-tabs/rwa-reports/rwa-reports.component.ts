import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rwa-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rwa-reports.component.html',
  styleUrl: './rwa-reports.component.scss'
})
export class RwaReportsComponent {
  @Input() userId?: number;

  reports = [
    {
      id: 1,
      title: 'Q4 2025 Performance Report',
      date: '2025-12-31',
      type: 'Quarterly',
      status: 'Published',
      icon: 'fa-file-pdf'
    },
    {
      id: 2,
      title: 'Asset Valuation Report',
      date: '2025-12-15',
      type: 'Valuation',
      status: 'Published',
      icon: 'fa-file-pdf'
    },
    {
      id: 3,
      title: 'Compliance Review 2025',
      date: '2025-12-01',
      type: 'Compliance',
      status: 'Published',
      icon: 'fa-file-pdf'
    },
    {
      id: 4,
      title: 'Risk Analysis Report',
      date: '2025-11-30',
      type: 'Risk Analysis',
      status: 'Published',
      icon: 'fa-file-pdf'
    },
    {
      id: 5,
      title: 'Monthly Summary - November',
      date: '2025-11-30',
      type: 'Monthly',
      status: 'Draft',
      icon: 'fa-file-alt'
    }
  ];

  constructor() {
    console.log('RwaReports: userId:', this.userId);
  }

  downloadReport(reportId: number) {
    console.log('Downloading report:', reportId);
  }

  viewReport(reportId: number) {
    console.log('Viewing report:', reportId);
  }
}
