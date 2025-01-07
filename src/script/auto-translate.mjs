import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'public', 'locales');

let translator = null;

async function loadTranslator() {
    if (!translator) {
      // Marian 번역 파이프라인 로드
      translator = await pipeline(
        'translation', 
        'Xenova/opus-mt-ko-en', 
        { progressCallback: console.log } // 옵션(진행 상황 로깅)
      );
    }
    return translator;
}

export async function translateText(text) {
    // 모델 로드
    const pipe = await loadTranslator();
    // 번역 실행
    const output = await pipe(text);
    // output은 보통 [{ translation_text: "..."}]
    return output[0].translation_text;
}

export async function autoTranslateMissingKeys(baseLang, targetLang, filename) {
    const basePath = path.join(localesDir, baseLang, filename);
    const targetPath = path.join(localesDir, targetLang, filename);
  
    if (!fs.existsSync(basePath)) {
      throw new Error(`기준 JSON 없음: ${basePath}`);
    }
  
    const baseData = JSON.parse(fs.readFileSync(basePath, 'utf8'));
    let targetData = {};
    if (fs.existsSync(targetPath)) {
      targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    }
  
    let updated = false;
    for (const [key, value] of Object.entries(baseData)) {
      if (!(key in targetData)) {
        // 누락된 부분만 번역
        const translated = await translateText(value);
        targetData[key] = translated;
        updated = true;
        console.log(`[${targetLang}] "${key}": "${value}" => "${translated}"`);
      }
    }
    
    if (updated) {
      fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
      console.log(`Updated: ${targetPath}`);
    } else {
      console.log(`No missing keys for ${filename} (${targetLang})!`);
    }
}