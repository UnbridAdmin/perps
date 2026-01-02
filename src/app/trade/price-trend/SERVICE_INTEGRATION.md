# Price Trend Component - Service Integration Guide

## Overview
This component displays community sentiment (Fierce Intuition) vs real market data for predictions. It supports both **binary** (Yes/No) and **multiple option** predictions.

## Data Structure

### PredictionData Interface
```typescript
interface PredictionData {
  type: 'binary' | 'multiple';
  options: MarketOption[];
}
```

### MarketOption Interface
```typescript
interface MarketOption {
  id: string;              // Unique identifier for the option
  name: string;            // Display name (e.g., "SÍ", "NO", "Camila", "Andrés")
  fierceIntuition: number; // Community vote percentage (0-100)
  marketPrice: number;     // Real market percentage (0-100)
  volume: string;          // Trading volume (e.g., "$226K")
}
```

## Example Data Structures

### Binary Prediction (Yes/No)
```json
{
  "type": "binary",
  "options": [
    {
      "id": "yes",
      "name": "SÍ",
      "fierceIntuition": 73,
      "marketPrice": 58,
      "volume": "$226K"
    },
    {
      "id": "no",
      "name": "NO",
      "fierceIntuition": 27,
      "marketPrice": 42,
      "volume": "$226K"
    }
  ]
}
```

### Multiple Options Prediction
```json
{
  "type": "multiple",
  "options": [
    {
      "id": "camila",
      "name": "Camila",
      "fierceIntuition": 78,
      "marketPrice": 45,
      "volume": "$120K"
    },
    {
      "id": "andres",
      "name": "Andrés",
      "fierceIntuition": 56,
      "marketPrice": 30,
      "volume": "$80K"
    },
    {
      "id": "alexandra",
      "name": "Alexandra",
      "fierceIntuition": 42,
      "marketPrice": 15,
      "volume": "$45K"
    },
    {
      "id": "samuel",
      "name": "Samuel",
      "fierceIntuition": 23,
      "marketPrice": 10,
      "volume": "$20K"
    }
  ]
}
```

## Service Integration Steps

### 1. Create the Service
```typescript
// src/app/services/prediction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'YOUR_API_URL';

  constructor(private http: HttpClient) {}

  getPredictionData(predictionId: string): Observable<PredictionData> {
    return this.http.get<PredictionData>(`${this.apiUrl}/predictions/${predictionId}/sentiment`);
  }
}
```

### 2. Update Component
```typescript
// price-trend.component.ts
import { PredictionService } from '../../services/prediction.service';

export class PriceTrendComponent implements OnInit {
  @Input() predictionId!: string; // Receive from parent

  constructor(private predictionService: PredictionService) {}

  ngOnInit() {
    this.predictionService.getPredictionData(this.predictionId)
      .subscribe(data => {
        this.predictionData = data;
      });
  }
}
```

### 3. Pass Data from Parent
```html
<!-- trade-detail.component.html -->
<app-price-trend [predictionId]="currentPredictionId"></app-price-trend>
```

## API Endpoint Requirements

### GET /predictions/:id/sentiment
**Response:**
```json
{
  "type": "binary" | "multiple",
  "options": [
    {
      "id": "string",
      "name": "string",
      "fierceIntuition": number,
      "marketPrice": number,
      "volume": "string"
    }
  ]
}
```

## Key Features

### Binary View
- Shows side-by-side comparison of Intuition vs Market
- Displays gap percentage with color coding (green = positive, red = negative)
- Insight box explaining if community is more optimistic/pessimistic

### Multiple Options View
- Ranked list of all options by Fierce Intuition
- Visual progress bars for intuition percentages
- Market comparison section with volume
- Gap indicators for each option

## Business Logic

### Gap Calculation
```typescript
gap = fierceIntuition - marketPrice
```

**Interpretation:**
- **Positive gap (+)**: Community is more bullish than market → Potential undervalued opportunity
- **Negative gap (-)**: Community is less bullish than market → Potential overvalued

### Example Use Case
```
Option: Camila
Fierce Intuition: 78%
Market Price: 45%
Gap: +33%

Insight: Community strongly believes Camila will be eliminated, 
but market only prices it at 45%. This could be a trading opportunity.
```

## Notes for Backend Team

1. **Fierce Intuition Calculation**: Aggregate all community votes for each option
2. **Market Price**: Current percentage from the prediction market
3. **Volume**: Total trading volume for that specific option
4. **Sorting**: For multiple options, sort by `fierceIntuition` DESC
5. **Real-time Updates**: Consider WebSocket for live data updates

## Testing Scenarios

1. **Binary with aligned sentiment**: Intuition ≈ Market (small gap)
2. **Binary with divergent sentiment**: Large gap between intuition and market
3. **Multiple options (4+ options)**: Test scrolling and layout
4. **Multiple options (2-3 options)**: Ensure proper spacing
5. **Edge cases**: 0% or 100% values, very small volumes

## Future Enhancements

- [ ] Historical trend charts (24h, 7d, 30d)
- [ ] Tooltip with detailed breakdown on hover
- [ ] Click to filter trading panel by selected option
- [ ] Real-time updates via WebSocket
- [ ] Export sentiment data
