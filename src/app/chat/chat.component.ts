import { Component } from '@angular/core';
import { AiBotService } from '../ai-bot.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
userInput:string=''
butRespunse:{ text: string, sender: string }[] = [];

constructor(private aiService:AiBotService){}

sendQuery(){
  if (this.userInput.trim() === '') return;
  this.butRespunse.push({ text: this.userInput, sender: 'me' });

  this.aiService.getResponse(this.userInput).subscribe(res=>{
    setTimeout(()=>{

      this.butRespunse.push({ text: res.response, sender: 'bot' });
    },500)
  })
  this.userInput = '';
}
}
