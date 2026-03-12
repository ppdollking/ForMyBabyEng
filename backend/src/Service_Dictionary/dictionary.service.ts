import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { wLogger } from '../util/logger/logger.winston.util';

export interface DictionaryResult {
  phonetic?: string;
  audioUrl?: string;
  meanings: { partOfSpeech: string; definitions: string[] }[];
}

@Injectable()
export class DictionaryService {
  private readonly API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

  async lookup(word: string): Promise<DictionaryResult | null> {
    try {
      const { data } = await axios.get(`${this.API_URL}/${encodeURIComponent(word.trim())}`);
      const entry = data[0];

      // 오디오 URL: phonetics 배열에서 첫 번째로 유효한 오디오 추출
      const audioUrl = entry.phonetics?.find((p: any) => p.audio)?.audio ?? null;
      const phonetic = entry.phonetic ?? entry.phonetics?.find((p: any) => p.text)?.text ?? null;

      const meanings = (entry.meanings ?? []).map((m: any) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions?.slice(0, 3).map((d: any) => d.definition) ?? [],
      }));

      return { phonetic, audioUrl, meanings };
    } catch (e) {
      // 단어를 찾지 못한 경우 null 반환 (404 포함)
      wLogger.warn(`Dictionary API 조회 실패 | word: ${word}, error: ${e?.message}`);
      return null;
    }
  }
}
