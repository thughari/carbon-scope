import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { ChatService, ChatMessage } from '../chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { SystemStatusService } from '../system-status.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatPanelComponent {
  @Input() currentCountry: string | null = null;
  @Input() currentContinent: string | null = null;
  @Input() currentYear: number = 2024;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  @ViewChild('chatInput') private chatInput!: ElementRef;

  private dataMessages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Hello! I analyze **global emissions data**. \n\nAsk me specific questions about the dashboard data.',
      time: new Date(),
    },
  ];

  private webMessages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Hello! I can browse the **live web** for latest climate news and policies. \n\nWhat would you like to search?',
      time: new Date(),
    },
  ];

  input = '';
  mode: 'data' | 'web' = 'data';
  isTyping = false;
  isStreaming = false;
  isOnline = false;

  constructor(
    private chatService: ChatService,
    private statusService: SystemStatusService
  ) {
    this.statusService.isOnline$.subscribe(
      (status) => (this.isOnline = status)
    );
  }

  get messages(): ChatMessage[] {
    return this.mode === 'data' ? this.dataMessages : this.webMessages;
  }

  setMode(m: 'data' | 'web') {
    this.mode = m;
    this.scrollToBottom();
    setTimeout(() => this.focusInput(), 100);
  }

  scrollToBottom(): void {
    if (!this.scrollContainer) return;
    setTimeout(() => {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  private focusInput(): void {
    if (this.chatInput) {
      this.chatInput.nativeElement.focus();
    }
  }

  private formatText(text: string): string {
    if (!text) return '';
    return text.replace(/([^\n])\n(- |\d+\. )/g, '$1\n\n$2');
  }

  async send() {
    if (!this.input.trim() || this.isTyping || this.isStreaming) return;

    const userMsg = this.input;
    this.input = '';

    const currentList =
      this.mode === 'data' ? this.dataMessages : this.webMessages;
    currentList.push({ sender: 'user', text: userMsg, time: new Date() });
    this.scrollToBottom();
    this.focusInput();

    this.isTyping = true;

    try {
      const botMessage: ChatMessage = {
        sender: 'bot',
        text: '',
        time: new Date(),
      };
      currentList.push(botMessage);

      let rawTextAccumulator = '';
      const historyToSend = currentList.slice(0, -1);

      await this.chatService.streamResponse(
        userMsg,
        this.mode,
        {
          country: this.currentCountry,
          year: this.currentYear,
          continent: this.currentContinent,
        },
        historyToSend,
        (chunk) => {
          if (this.isTyping) {
            this.isTyping = false;
            this.isStreaming = true;
          }
          rawTextAccumulator += chunk;
          botMessage.text = this.formatText(rawTextAccumulator);
          this.scrollToBottom();
        },
        () => {
          this.isStreaming = false;
          this.scrollToBottom();
          this.focusInput();
        },
        (err) => {
          console.error(err);
          botMessage.text +=
            '\n\n**System Offline**: _I cannot process requests right now._';
          this.isTyping = false;
          this.isStreaming = false;
          this.scrollToBottom();
          this.focusInput();
        }
      );
    } catch (e) {
      console.error(e);
      this.isTyping = false;
    }
  }
}
