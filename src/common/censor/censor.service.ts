import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CensorService {
    constructor(private readonly configService: ConfigService) {}

    censor(text: string): string {
        const rawData = this.configService.getOrThrow<string>('BANNED_WORDS');
        console.log(rawData);
        const bannedWords: string[] = JSON.parse(rawData);

        if (!text) return text;
        
        let censoredText = text;

        bannedWords.forEach((word: string) => {
            if (word.length < 3) return;

            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            
            const replacement = '**'.repeat(word.length);

            censoredText = censoredText.replace(regex, replacement);
        });

        return censoredText;
    }
}