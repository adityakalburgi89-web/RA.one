import { Language, LanguageCode } from '@/types/chat';

export const LANGUAGES: Record<LanguageCode, Language> = {
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptSymbol: 'श्री',
    greeting: 'प्रणाम मरणशील। मैं लंकाधिपति दशानन रावण हूँ — दश महाविद्याओं का स्वामी, वेदों का ज्ञाता और महाकाल का अनन्य भक्त। कहो, क्या जानना चाहते हो?',
    placeholder: 'दशानन रावण से प्रश्न पूछें...',
    sampleQuestions: [
      'शिव तांडव स्तोत्र की रचना आपने कैसे की?',
      'लंका के स्वर्णिम काल और उसकी भव्यता के बारे में बताएं।',
      'रामायण के विभिन्न दृष्टिकोणों पर आपका क्या विचार है?',
      'सामवेद और संगीत में आपकी प्रवीणता का क्या रहस्य था?'
    ]
  },
  'kn-IN': {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    scriptSymbol: 'ಶ್ರೀ',
    greeting: 'ನಮಸ್ಕಾರ ಮರ್ತ್ಯನೇ. ನಾನು ಲಂಕಾಧಿಪತಿ ದಶಕಂಠ ರಾವಣ — ಚತುರ್ವೇದಗಳ ಮತ್ತು ಷಡ್ಶಾಸ್ತ್ರಗಳ ಪಂಡಿತ, ಪರಮಶಿವನ ಭಕ್ತ. ನಿನ್ನ ಜಿಜ್ಞಾಸೆಯನ್ನು ಮಂಡಿಸು.',
    placeholder: 'ಲಂಕೇಶ್ವರ ರಾವಣನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...',
    sampleQuestions: [
      'ಶಿವ ತಾಂಡವ ಸ್ತೋತ್ರವನ್ನು ನೀವು ಹೇಗೆ ರಚಿಸಿದಿರಿ?',
      'ಹೇಮಾಂಗ ಲಂಕೆಯ ಶ್ರೀಮಂತಿಕೆ ಮತ್ತು ತಂತ್ರಜ್ಞಾನದ ಬಗ್ಗೆ ತಿಳಿಸಿ.',
      'ರಾಮಾಯಣದ ವಿವಿಧ ಪ್ರಾಂತೀಯ ವ್ಯಾಖ್ಯಾನಗಳ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಭಿಪ್ರಾಯವೇನು?',
      'ನಿಮ್ಮ ಹತ್ತು ತಲೆಗಳು ಮತ್ತು ಜ್ಞಾನದ ಸಂಕೇತವೇನು?'
    ]
  },
  'te-IN': {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    scriptSymbol: 'శ్రీ',
    greeting: 'నమస్కారం మానవుడా! నేను లంకాధిపతి దశకంథ రావణుడను — చతుర్వేద పండితుడను, పరమశివుని పరమ భక్తుడను. నీ ప్రశ్న ఏమిటో చెప్పు.',
    placeholder: 'దశకoఠ రావణుడిని ప్రశ్నించండి...',
    sampleQuestions: [
      'శివ తాండవ స్తోత్రాన్ని మీరు ఎలా రచించారు?',
      'స్వర్ణ లంక వైభవం మరియు దండు మొనర ప్రజ్ఞ గురించి వివరించండి.',
      'రామాయణంలోని విభిన్న ప్రాంతీయ మరియు సాంప్రదాయ దృక్పథాలపై మీ అభిప్రాయం ఏమిటి?',
      'సామవేదంలో మీ సంగీత ప్రావీణ్యం వెనుక ఉన్న రహస్యం ఏమిటి?'
    ]
  },
  'ta-IN': {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    scriptSymbol: 'ஓம்',
    greeting: 'வணக்கம் மானுடனே. நான் இலங்கை வேந்தன் தசகண்ட இராவணன் — நான்மறை வல்லோன், சிவபெருமானின் பேரன்பு பெற்ற வீணை வித்தகன். உனது வினாவை முன்வை.',
    placeholder: 'இராவண மன்னனிடம் வினவவும்...',
    sampleQuestions: [
      'சிவதாண்டவ ஸ்தோத்திரம் இயற்றிய வரலாற்றைக் கூறுக.',
      'இலங்கை நகரத்தின் பொன்வளம் மற்றும் புஷ்பக விமானம் பற்றிய சிறப்பு என்ன?',
      'ராமாயணத்தின் பல்வேறு பிராந்திய மற்றும் மரபுசார் விளக்கங்கள் பற்றி உங்கள் கருத்து என்ன?',
      'உங்கள் பத்து தலைகள் எதனைக் குறிக்கின்றன?'
    ]
  },
  'en-IN': {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    scriptSymbol: '⚜',
    greeting: 'Greetings, seeker. I am Lankeshwar Ravana — Ruler of Suvarna Lanka, Scholar of the 4 Vedas, Wielder of Shiva\'s Grace. Speak your query.',
    placeholder: 'Seek wisdom from the Ten-Headed King of Lanka...',
    sampleQuestions: [
      'Why did you compose the Shiva Tandava Stotram?',
      'What are your views on different traditions and perspectives of the Ramayana?',
      'Describe the grandeur and aerial vimana technology of Golden Lanka.',
      'What do your ten heads symbolize regarding Vedic wisdom and statecraft?'
    ]
  }
};

export const DEFAULT_LANGUAGE: LanguageCode = 'kn-IN';
