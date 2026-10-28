import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideMarkdown } from 'ngx-markdown';
import { ChatPanelComponent } from './chat-panel.component';
import { ChatService } from '../chat.service';
import { SystemStatusService } from '../system-status.service';

describe('ChatPanelComponent', () => {
  let component: ChatPanelComponent;
  let fixture: ComponentFixture<ChatPanelComponent>;

  const mockChatService = {
    streamAi: () => of('mock stream token')
  };

  const mockSystemStatusService = {
    isOnline$: of(true),
    health$: of({ status: 'UP' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatPanelComponent],
      providers: [
        provideMarkdown(),
        { provide: ChatService, useValue: mockChatService },
        { provide: SystemStatusService, useValue: mockSystemStatusService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
