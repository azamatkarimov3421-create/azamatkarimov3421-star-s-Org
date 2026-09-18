// =====================================================
// NUR CHESS 100 — Multi-Language (i18n) Support
// 5 Languages: Uzbek Latin, Uzbek Cyrillic, Russian, English, Karakalpak
// =====================================================

export type AppLanguage = 'uz' | 'uz_cyr' | 'ru' | 'en' | 'kaa';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'uz', name: 'Oʻzbekcha (Lotin)', nativeName: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'uz_cyr', name: 'Ўзбекча (Кирилл)', nativeName: 'Ўзбекча', flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'kaa', name: 'Qaraqalpaqsha', nativeName: 'Қарақалпақша', flag: '🇰🇿' },
];

export const TRANSLATIONS = {
  uz: {
    nav_home: 'Bosh sahifa',
    nav_game: 'Oʻyin',
    nav_rules: 'Qoidalar',
    nav_achievements: 'Yutuqlar',
    nav_settings: 'Sozlamalar',
    settings_title: 'Sozlamalar',
    settings_subtitle: 'Ilova va oʻyin parametrlarini sozlang',
    lang_setting: 'Til',
    sound_setting: 'Ovoz effektlari',
    sound_theme_setting: 'Tovush mavzusi',
    sound_test_title: 'Tovushlarni sinash',
    test_move: '♟️ Yurish',
    test_capture: '⚔️ Zarba',
    test_nur: '⚡ Nur',
    test_check: '👑 Shah',
    notation_setting: '1–100 raqamli notatsiya',
    notation_desc: 'Kataklarda 1 dan 100 gacha raqamlarni koʻrsatish',
    vibration_setting: 'Tebranish (Vibratsiya)',
    board_theme_setting: 'Dosqa uslubi',
    ai_difficulty_setting: 'AI qiyinchilik darajasi',
    help_setting: 'Yordam & Koʻrsatmalar',
    about_setting: 'Biz haqimizda & Patent',
    app_version_setting: 'Ilova versiyasi',
    check_update_btn: 'Yangilanishni tekshirish',
    checking_update: 'Tekshirilmoqda...',
    latest_version_installed: 'Sizda eng soʻnggi versiya oʻrnatilgan!',
    close_btn: 'Yopish',
    select_lang_title: 'Tilni tanlang',
    select_sound_theme_title: 'Tovush mavzusini tanlang',
    select_board_theme_title: 'Dosqa uslubini tanlang',
    select_ai_level_title: 'AI qiyinchilik darajasi',
  },
  uz_cyr: {
    nav_home: 'Бош саҳифа',
    nav_game: 'Ўйин',
    nav_rules: 'Қоидалар',
    nav_achievements: 'Ютуқлар',
    nav_settings: 'Созламалар',
    settings_title: 'Созламалар',
    settings_subtitle: 'Илова ва ўйин параметрларини созланг',
    lang_setting: 'Тил',
    sound_setting: 'Овоз эффектлари',
    sound_theme_setting: 'Товуш мавзуси',
    sound_test_title: 'Товушларни синаш',
    test_move: '♟️ Юриш',
    test_capture: '⚔️ Зарба',
    test_nur: '⚡ Нур',
    test_check: '👑 Шоҳ',
    notation_setting: '1–100 рақамли нотация',
    notation_desc: 'Катакларда 1 дан 100 гача рақамларни кўрсатиш',
    vibration_setting: 'Тебраниш (Вибрация)',
    board_theme_setting: 'Доска услуби',
    ai_difficulty_setting: 'AI қийинчилик даражаси',
    help_setting: 'Ёрдам & Кўрсатмалар',
    about_setting: 'Биз ҳақимизда & Патент',
    app_version_setting: 'Илова версияси',
    check_update_btn: 'Янгиланишни текшириш',
    checking_update: 'Текширилмоқда...',
    latest_version_installed: 'Сизда энг сўнгги версия ўрнатилган!',
    close_btn: 'Ёпиш',
    select_lang_title: 'Тилни танланг',
    select_sound_theme_title: 'Товуш мавзусини танланг',
    select_board_theme_title: 'Доска услубини танланг',
    select_ai_level_title: 'AI қийинчилик даражаси',
  },
  ru: {
    nav_home: 'Главная',
    nav_game: 'Игра',
    nav_rules: 'Правила',
    nav_achievements: 'Достижения',
    nav_settings: 'Настройки',
    settings_title: 'Настройки',
    settings_subtitle: 'Настройки приложения и игрового процесса',
    lang_setting: 'Язык',
    sound_setting: 'Звуковые эффекты',
    sound_theme_setting: 'Тема звуков',
    sound_test_title: 'Тестирование звуков',
    test_move: '♟️ Ход',
    test_capture: '⚔️ Взятие',
    test_nur: '⚡ Нур',
    test_check: '👑 Шах',
    notation_setting: 'Цифровая нотация 1–100',
    notation_desc: 'Отображать номера 1–100 на клетках доски',
    vibration_setting: 'Вибрация',
    board_theme_setting: 'Стиль доски',
    ai_difficulty_setting: 'Сложность ИИ',
    help_setting: 'Помощь и инструкции',
    about_setting: 'О проекте и Патенте',
    app_version_setting: 'Версия приложения',
    check_update_btn: 'Проверить обновление',
    checking_update: 'Проверка...',
    latest_version_installed: 'У вас установлена последняя версия!',
    close_btn: 'Закрыть',
    select_lang_title: 'Выберите язык',
    select_sound_theme_title: 'Выберите тему звука',
    select_board_theme_title: 'Выберите стиль доски',
    select_ai_level_title: 'Уровень сложности ИИ',
  },
  en: {
    nav_home: 'Home',
    nav_game: 'Play',
    nav_rules: 'Rules',
    nav_achievements: 'Badges',
    nav_settings: 'Settings',
    settings_title: 'Settings',
    settings_subtitle: 'Customize app & gameplay preferences',
    lang_setting: 'Language',
    sound_setting: 'Sound Effects',
    sound_theme_setting: 'Sound Theme',
    sound_test_title: 'Test Audio Tones',
    test_move: '♟️ Move',
    test_capture: '⚔️ Capture',
    test_nur: '⚡ Nur',
    test_check: '👑 Check',
    notation_setting: '1–100 Numerical Notation',
    notation_desc: 'Show 1 to 100 coordinate labels on squares',
    vibration_setting: 'Haptic Vibration',
    board_theme_setting: 'Board Theme',
    ai_difficulty_setting: 'AI Difficulty',
    help_setting: 'Help & Instructions',
    about_setting: 'About & Patent',
    app_version_setting: 'App Version',
    check_update_btn: 'Check for Updates',
    checking_update: 'Checking...',
    latest_version_installed: 'You have the latest version installed!',
    close_btn: 'Close',
    select_lang_title: 'Select Language',
    select_sound_theme_title: 'Select Sound Theme',
    select_board_theme_title: 'Select Board Theme',
    select_ai_level_title: 'AI Difficulty Level',
  },
  kaa: {
    nav_home: 'Bas bet',
    nav_game: 'Oyın',
    nav_rules: 'Qagʻıydalar',
    nav_achievements: 'Jetiskenlikler',
    nav_settings: 'Sazlawlar',
    settings_title: 'Sazlawlar',
    settings_subtitle: 'Qosımsha hám oyın parametrlerin sazlań',
    lang_setting: 'Til',
    sound_setting: 'Dawıs effektleri',
    sound_theme_setting: 'Dawıs teması',
    sound_test_title: 'Dawıslardı sınaqtan ótkeriw',
    test_move: '♟️ Júris',
    test_capture: '⚔️ Urıw',
    test_nur: '⚡ Nur',
    test_check: '👑 Shah',
    notation_setting: '1–100 sanlı notaciya',
    notation_desc: 'Kataklarda 1 den 100 ge shekem sanlardı kórsetiw',
    vibration_setting: 'Tebranish (Vibraciya)',
    board_theme_setting: 'Doska stili',
    ai_difficulty_setting: 'AI qıyınlıq dárejesi',
    help_setting: 'Járdem & Kórsetpeler',
    about_setting: 'Biz haqqımızda & Patent',
    app_version_setting: 'Qosımsha versiyası',
    check_update_btn: 'Jańalanıwdı tekseriw',
    checking_update: 'Tekserilmekte...',
    latest_version_installed: 'Sizde eń sońǵı versiya ornatılǵan!',
    close_btn: 'Jabıw',
    select_lang_title: 'Tildi saylań',
    select_sound_theme_title: 'Dawıs temasın saylań',
    select_board_theme_title: 'Doska stiline saylań',
    select_ai_level_title: 'AI qıyınlıq dárejesi',
  },
};

let currentLanguage: AppLanguage = (() => {
  try {
    const saved = localStorage.getItem('nur_chess_lang') as AppLanguage;
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch {}
  return 'uz';
})();

export function getAppLanguage(): AppLanguage {
  return currentLanguage;
}

export function setAppLanguage(lang: AppLanguage): void {
  currentLanguage = lang;
  try {
    localStorage.setItem('nur_chess_lang', lang);
  } catch {}
}

export function t(key: keyof typeof TRANSLATIONS['uz']): string {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.uz;
  return dict[key] || TRANSLATIONS.uz[key] || key;
}