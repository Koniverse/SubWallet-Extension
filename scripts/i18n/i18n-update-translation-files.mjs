#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// --- ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN ---
const languages = ['en', 'vi', 'ja', 'zh', 'ru'];
const translationFiles = languages.map(lng => `packages/extension-koni/public/locales/${lng}/translation.json`);
const backupOutputFilePath = 'packages/extension-koni/public/locales/backup-combined-data.json';

// --- CÁC HÀM TIỆN ÍCH ---
function loadTranslations(langFile) {
  try {
    if (!fs.existsSync(langFile)) {
      console.warn(`File dịch không tồn tại: ${langFile}. Sẽ tạo file mới.`);
      const dir = path.dirname(langFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      return {};
    }
    return JSON.parse(fs.readFileSync(langFile, 'utf-8'));
  } catch (error) {
    console.error(`Lỗi khi đọc ${langFile}:`, error);
    return {};
  }
}

function updateTranslationFile(langFile, newTranslations) {
  try {
    fs.writeFileSync(langFile, JSON.stringify(newTranslations, null, 2), 'utf-8');
    console.log(`   - Cập nhật thành công file: ${path.basename(langFile)}`);
  } catch (error) {
    console.error(`Lỗi khi ghi file ${langFile}:`, error);
  }
}

// --- HÀM CHÍNH ---
function main() {
  console.log('--- SCRIPT 2: CẬP NHẬT CÁC FILE DỊCH ---');

  // BƯỚC 1: ĐỌC FILE KẾT HỢP
  console.log(`\nBƯỚC 1: Đang đọc file dữ liệu kết hợp từ ${backupOutputFilePath}...`);
  if (!fs.existsSync(backupOutputFilePath)) {
    console.error(`[LỖI] File "${backupOutputFilePath}" không tồn tại. Vui lòng chạy script 'generate-mappings.js' trước.`);
    process.exit(1);
  }
  const combinedMapping = JSON.parse(fs.readFileSync(backupOutputFilePath, 'utf-8'));

  // BƯỚC 2: LẶP QUA TỪNG NGÔN NGỮ ĐỂ CẬP NHẬT
  console.log('\nBƯỚC 2: Bắt đầu cập nhật các file dịch...');
  for (const langFile of translationFiles) {
    console.log(`\n--- Đang xử lý ngôn ngữ: (${langFile}) ---`);

    const existingTranslations = loadTranslations(langFile);
    const newTranslations = { ...existingTranslations };

    for (const [originalText, mappings] of Object.entries(combinedMapping)) {
      // Bỏ qua key rỗng để đảm bảo an toàn
      if (!originalText) continue;

      let translationValue;
      if (langFile.includes('/en/')) {
        translationValue = originalText;
      } else {
        const translatedValue = existingTranslations[originalText];
        if (translatedValue && translatedValue.trim() !== '') {
          translationValue = translatedValue;
        } else {
          translationValue = originalText; // Fallback về tiếng Anh
          // In ra cảnh báo để người dịch biết chuỗi nào cần bổ sung
          if (existingTranslations.hasOwnProperty(originalText)) {
            console.log(`   - Key "${originalText}" có bản dịch rỗng, tạm dùng tiếng Anh.`);
          }
        }
      }

      // Gán giá trị dịch đã được xác định cho tất cả các key có cấu trúc mới
      for (const mapping of mappings) {
        const newKey = mapping.key;
        newTranslations[newKey] = translationValue;
      }

      if (existingTranslations.hasOwnProperty(originalText)) {
        delete newTranslations[originalText];
      }

      // Sau khi đã gán cho key mới, xóa key cũ (nếu có) khỏi bản sao
      if (existingTranslations.hasOwnProperty(originalText)) {
        console.log(`===== Deleted text ${originalText} ======`)
        delete newTranslations[originalText];
      }
    }

    updateTranslationFile(langFile, newTranslations);
  }

  console.log('\n--- SCRIPT 2 HOÀN TẤT ---');
}

main();
