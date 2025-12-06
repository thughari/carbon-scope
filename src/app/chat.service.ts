import { Injectable, NgZone } from '@angular/core';
import { environment } from '../environments/environment';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = `${environment.apiUrl}/api/ai/stream`;

  constructor(private ngZone: NgZone) {}

  async streamResponse(
    question: string,
    mode: 'data' | 'web',
    filters: any,
    history: ChatMessage[],
    onChunk: (text: string) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ) {
    try {
      const simpleHistory = history.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          mode,
          country: filters.country,
          continent: filters.continent,
          year: filters.year,
          history: simpleHistory,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          this.ngZone.run(onComplete);
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        this.ngZone.run(() => onChunk(chunk));
      }
    } catch (err) {
      this.ngZone.run(() => onError(err));
    }
  }
}
