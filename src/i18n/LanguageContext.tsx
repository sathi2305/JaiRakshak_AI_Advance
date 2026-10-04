import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type SupportedLanguageCode =
  | 'en'
  | 'ta'
  | 'hi'
  | 'te'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja';

export interface LanguageOption {
  code: SupportedLanguageCode;
  shortLabel: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', shortLabel: 'EN', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'Global' },
  { code: 'ta', shortLabel: 'தமிழ்', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'India (TN)' },
  { code: 'hi', shortLabel: 'हिन्दी', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  { code: 'te', shortLabel: 'తెలుగు', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'India (AP/TS)' },
  { code: 'kn', shortLabel: 'ಕನ್ನಡ', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'India (KA)' },
  { code: 'ml', shortLabel: 'മലയാളം', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'India (KL)' },
  { code: 'mr', shortLabel: 'मराठी', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'India (MH)' },
  { code: 'bn', shortLabel: 'বাংলা', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'India (WB)' },
  { code: 'es', shortLabel: 'ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Europe / LatAm' },
  { code: 'fr', shortLabel: 'FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe' },
  { code: 'de', shortLabel: 'DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'ja', shortLabel: '日本語', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Asia' }
];

// Comprehensive built-in dictionary for instant zero-latency translation of common UI elements
const CORE_DICTIONARY: Record<Exclude<SupportedLanguageCode, 'en'>, Record<string, string>> = {
  ta: {
    'Command Center': 'கட்டளை மையம்',
    'Master Command Center': 'முதன்மை கட்டளை மையம்',
    'Real-Time Monitoring': 'நிகழ்நேர கண்காணிப்பு',
    'Real-Time Telemetry': 'நிகழ்நேர டெலிமெட்ரி',
    'Digital Water Twin': 'டிஜிட்டல் நீர் இரட்டை',
    'Anomaly & Leak Risk': 'கசிவு மற்றும் அபாய மையம்',
    'Forecast & Optimization': 'முன்னறிவிப்பு & உகப்பாக்கம்',
    'Forecast & Reservoir': 'முன்னறிவிப்பு & நீர்த்தேக்கம்',
    'Smart Recommendations': 'ஸ்மார்ட் பரிந்துரைகள்',
    'Smart Actions': 'ஸ்மார்ட் நடவடிக்கைகள்',
    'What-If Simulator': 'உருவகப்படுத்துதல் மையம்',
    'Predictive Maintenance': 'முன்கணிப்பு பராமரிப்பு',
    'Predictive Maint.': 'முன்கணிப்பு பராமரிப்பு',
    'Water Quality Module': 'நீர் தர தொகுதி',
    'Water Quality': 'நீர் தரம்',
    'Geo-Spatial Intelligence': 'புவிசார் நுண்ணறிவு',
    'Geo-Spatial Map': 'புவிசார் வரைபடம்',
    'Multi-Building Analytics': 'கட்டிட பகுப்பாய்வு',
    'Multi-Building': 'பல கட்டிடங்கள்',
    'Sustainability & Impact': 'நிலைத்தன்மை & தாக்கம்',
    'Sustainability & Leaderboard': 'நிலைத்தன்மை & தரவரிசை',
    'Reports & AI Summary': 'அறிக்கைகள் & AI சுருக்கம்',
    'Reports & Summary': 'அறிக்கைகள் & சுருக்கம்',
    'Sensor Fleet & Quality': 'சென்சார் தொகுப்பு',
    'Sensors & Thresholds': 'சென்சார்கள் & வரம்புகள்',
    'Security & Audit Trail': 'பாதுகாப்பு & தணிக்கை',
    'Audit Ledger': 'தணிக்கை பேரேடு',
    'All Modules': 'அனைத்து தொகுதிகள்',
    'Live Operations': 'நேரலை செயல்பாடுகள்',
    'AI & Forecasting': 'AI & முன்னறிவிப்பு',
    'ESG & Governance': 'ESG & நிர்வாகம்',
    'Install Desktop App': 'டெஸ்க்டாப் ஆப் நிறுவு',
    'AI Copilot': 'AI கோபைலட்',
    'Copilot': 'கோபைலட்',
    'Simulate Leak': 'கசிவை உருவகப்படுத்து',
    'Clear Leak': 'கசிவை நீக்கு',
    'Flow:': 'ஓட்டம்:',
    'Pressure:': 'அழுத்தம்:',
    'Twin:': 'இரட்டை:',
    'Light': 'வெளிச்சம்',
    'Dark': 'இருள்',
    'Live Stream': 'நேரலை ஓட்டம்',
    'Live': 'நேரலை',
    'Next 24 Hours': 'அடுத்த 24 மணிநேரம்',
    '7-Day Outlook': '7-நாள் முன்னறிவிப்பு',
    '30-Day Outlook': '30-நாள் முன்னறிவிப்பு',
    'Sync Weather': 'வானிலை ஒத்திசை',
    'Syncing...': 'ஒத்திசைக்கிறது...',
    'Local GPS': 'உள்ளூர் ஜிபிஎஸ்',
    'Regional Reservoir Level': 'மண்டல நீர்த்தேக்க நிலை',
    'Supply-to-Demand Ratio': 'விநியோக-தேவை விகிதம்',
    'Autonomous Reserve Days': 'தன்னாட்சி இருப்பு நாட்கள்',
    'Conjunctive Aquifer Buffer': 'நிலத்தடி நீர் இடையகம்',
    'AI Demand Forecasting & Meteorological Optimization': 'AI நீர் தேவை முன்னறிவிப்பு மற்றும் வானிலை உகப்பாக்கம்',
    'Local Meteorological Data & Demand Refinement Service': 'உள்ளூர் வானிலை தரவு மற்றும் நீர் தேவை சுத்திகரிப்பு சேவை',
    'Resource Availability & Regional Reservoir Correlation': 'வள இருப்பு மற்றும் மண்டல நீர்த்தேக்க தொடர்பு',
    'Sign Out of Command Center': 'கட்டளை மையத்திலிருந்து வெளியேறு',
    'Chief Hydrologist': 'தலைமை நீரியல் நிபுணர்',
    'Autonomous Water Grid': 'தன்னாட்சி நீர் கட்டமைப்பு'
  },
  hi: {
    'Command Center': 'कमांड सेंटर',
    'Master Command Center': 'मास्टर कमांड सेंटर',
    'Real-Time Monitoring': 'रीयल-टाइम निगरानी',
    'Real-Time Telemetry': 'रीयल-टाइम टेलीमेट्री',
    'Digital Water Twin': 'डिजिटल वॉटर ट्विन',
    'Anomaly & Leak Risk': 'रिसाव और जोखिम केंद्र',
    'Forecast & Optimization': 'पूर्वानुमान और अनुकूलन',
    'Forecast & Reservoir': 'पूर्वानुमान और जलाशय',
    'Smart Recommendations': 'स्मार्ट सिफारिशें',
    'Smart Actions': 'स्मार्ट कार्य',
    'What-If Simulator': 'व्हाट-इफ सिम्युलेटर',
    'Predictive Maintenance': 'भविष्य कहनेवाला रखरखाव',
    'Predictive Maint.': 'भविष्य कहनेवाला रखरखाव',
    'Water Quality Module': 'जल गुणवत्ता मॉड्यूल',
    'Water Quality': 'जल गुणवत्ता',
    'Geo-Spatial Intelligence': 'भू-स्थानिक बुद्धिमत्ता',
    'Geo-Spatial Map': 'भू-स्थानिक मानचित्र',
    'Multi-Building Analytics': 'बहु-भवन विश्लेषण',
    'Multi-Building': 'बहु-भवन',
    'Sustainability & Impact': 'स्थिरता और प्रभाव',
    'Sustainability & Leaderboard': 'स्थिरता और लीडरबोर्ड',
    'Reports & AI Summary': 'रिपोर्ट और एआई सारांश',
    'Reports & Summary': 'रिपोर्ट और सारांश',
    'Sensor Fleet & Quality': 'सेंसर बेड़ा और गुणवत्ता',
    'Sensors & Thresholds': 'सेंसर और सीमाएँ',
    'Security & Audit Trail': 'सुरक्षा और ऑडिट ट्रेल',
    'Audit Ledger': 'ऑडिट लेजर',
    'All Modules': 'सभी मॉड्यूल',
    'Live Operations': 'लाइव संचालन',
    'AI & Forecasting': 'एआई और पूर्वानुमान',
    'ESG & Governance': 'ईएसजी और प्रशासन',
    'Install Desktop App': 'डेस्कटॉप ऐप इंस्टॉल करें',
    'AI Copilot': 'एआई कोपायलट',
    'Copilot': 'कोपायलट',
    'Simulate Leak': 'लीक सिम्युलेट करें',
    'Clear Leak': 'लीक साफ़ करें',
    'Flow:': 'प्रवाह:',
    'Pressure:': 'दबाव:',
    'Twin:': 'ट्विन:',
    'Light': 'लाइट',
    'Dark': 'डार्क',
    'Live Stream': 'लाइव स्ट्रीम',
    'Live': 'लाइव',
    'Next 24 Hours': 'अगले 24 घंटे',
    '7-Day Outlook': '7-दिवसीय दृष्टिकोण',
    '30-Day Outlook': '30-दिवसीय दृष्टिकोण',
    'Sync Weather': 'मौसम सिंक करें',
    'Syncing...': 'सिंक हो रहा है...',
    'Local GPS': 'लोकल जीपीएस',
    'Regional Reservoir Level': 'क्षेत्रीय जलाशय स्तर',
    'Supply-to-Demand Ratio': 'आपूर्ति-मांग अनुपात',
    'Autonomous Reserve Days': 'स्वायत्त आरक्षित दिन',
    'Conjunctive Aquifer Buffer': 'एक्विफर बफर',
    'AI Demand Forecasting & Meteorological Optimization': 'एआई मांग पूर्वानुमान और मौसम विज्ञान अनुकूलन',
    'Local Meteorological Data & Demand Refinement Service': 'स्थानीय मौसम डेटा और मांग शोधन सेवा',
    'Resource Availability & Regional Reservoir Correlation': 'संसाधन उपलब्धता और क्षेत्रीय जलाशय सहसंबंध',
    'Sign Out of Command Center': 'कमांड सेंटर से साइन आउट करें',
    'Chief Hydrologist': 'मुख्य जलविज्ञानी',
    'Autonomous Water Grid': 'स्वायत्त जल ग्रिड'
  },
  te: {
    'Command Center': 'కమాండ్ సెంటర్',
    'Master Command Center': 'మాస్టర్ కమాండ్ సెంటర్',
    'Real-Time Monitoring': 'రియల్-టైమ్ మానిటరింగ్',
    'Digital Water Twin': 'డిజిటల్ వాటర్ ట్విన్',
    'Anomaly & Leak Risk': 'లీకేజీ ప్రమాద కేంద్రం',
    'Forecast & Optimization': 'అంచనా & ఆప్టిమైజేషన్',
    'Smart Recommendations': 'స్మార్ట్ సిఫార్సులు',
    'What-If Simulator': 'సిమ్యులేటర్',
    'Predictive Maintenance': 'ముందస్తు నిర్వహణ',
    'Water Quality Module': 'నీటి నాణ్యత మాడ్యూల్',
    'Geo-Spatial Intelligence': 'జియో-స్పేషియల్ ఇంటెలిజెన్స్',
    'Multi-Building Analytics': 'మల్టీ-బిల్డింగ్ అనలిటిక్స్',
    'Sustainability & Impact': 'సుస్థిరత & ప్రభావం',
    'Reports & AI Summary': 'నివేదికలు & AI సారాంశం',
    'Sensor Fleet & Quality': 'సెన్సార్ ఫ్లీట్',
    'Security & Audit Trail': 'భద్రత & ఆడిట్ ట్రయల్',
    'Install Desktop App': 'డెస్క్‌టాప్ యాప్ ఇన్‌స్టాల్',
    'AI Copilot': 'AI కోపైలట్',
    'Flow:': 'ప్రవాహం:',
    'Pressure:': 'పీడనం:',
    'Live Stream': 'లైవ్ స్ట్రీమ్',
    'Next 24 Hours': 'తదుపరి 24 గంటలు',
    '7-Day Outlook': '7-రోజుల అంచనా',
    '30-Day Outlook': '30-రోజుల అంచనా',
    'Sync Weather': 'వాతావరణం సింక్',
    'Local GPS': 'లోకల్ GPS',
    'Regional Reservoir Level': 'ప్రాంతీయ రిజర్వాయర్ స్థాయి'
  },
  kn: {
    'Command Center': 'ಕಮಾಂಡ್ ಸೆಂಟರ್',
    'Master Command Center': 'ಮಾಸ್ಟರ್ ಕಮಾಂಡ್ ಸೆಂಟರ್',
    'Real-Time Monitoring': 'ನೈಜ-ಸಮಯದ ಮೇಲ್ವಿಚಾರಣೆ',
    'Digital Water Twin': 'ಡಿಜಿಟಲ್ ವಾಟರ್ ಟ್ವಿನ್',
    'Anomaly & Leak Risk': 'ಸೋರಿಕೆ ಅಪಾಯ ಕೇಂದ್ರ',
    'Forecast & Optimization': 'ಮುನ್ಸೂಚನೆ ಮತ್ತು ಆಪ್ಟಿಮೈಸೇಶನ್',
    'Smart Recommendations': 'ಸ್ಮಾರ್ಟ್ ಶಿಫಾರಸುಗಳು',
    'What-If Simulator': 'ಸಿಮ್ಯುಲೇಟರ್',
    'Predictive Maintenance': 'ಮುನ್ಸೂಚಕ ನಿರ್ವಹಣೆ',
    'Water Quality Module': 'ನೀರಿನ ಗುಣಮಟ್ಟ ಘಟಕ',
    'Geo-Spatial Intelligence': 'ಭೂ-ಬಾಹ್ಯಾಕಾಶ ಬುದ್ಧಿಮತ್ತೆ',
    'Multi-Building Analytics': 'ಬಹು-ಕಟ್ಟಡ ವಿಶ್ಲೇಷಣೆ',
    'Sustainability & Impact': 'ಸುಸ್ಥಿರತೆ ಮತ್ತು ಪ್ರಭಾವ',
    'Reports & AI Summary': 'ವರದಿಗಳು ಮತ್ತು AI ಸಾರಾಂಶ',
    'Sensor Fleet & Quality': 'ಸೆನ್ಸಾರ್ ಫ್ಲೀಟ್',
    'Security & Audit Trail': 'ಭದ್ರತೆ ಮತ್ತು ಆಡಿಟ್',
    'Install Desktop App': 'ಡೆಸ್ಕ್‌ಟಾಪ್ ಆಪ್ ಸ್ಥಾಪಿಸಿ',
    'AI Copilot': 'AI ಕೋಪೈಲಟ್',
    'Flow:': 'ಹರಿವು:',
    'Pressure:': 'ಒತ್ತಡ:',
    'Next 24 Hours': 'ಮುಂದಿನ 24 ಗಂಟೆಗಳು',
    '7-Day Outlook': '7-ದಿನಗಳ ಮುನ್ನೋಟ',
    '30-Day Outlook': '30-ದಿನಗಳ ಮುನ್ನೋಟ',
    'Sync Weather': 'ಹವಾಮಾನ ಸಿಂಕ್'
  },
  ml: {
    'Command Center': 'കമാൻഡ് സെന്റർ',
    'Master Command Center': 'മാസ്റ്റർ കമാൻഡ് സെന്റർ',
    'Real-Time Monitoring': 'തത്സമയ നിരീക്ഷണം',
    'Digital Water Twin': 'ഡിജിറ്റൽ വാട്ടർ ട്വിൻ',
    'Anomaly & Leak Risk': 'ചോർച്ചാ അപകട കേന്ദ്രം',
    'Forecast & Optimization': 'പ്രവചനവും ഒപ്റ്റിമൈസേഷനും',
    'Smart Recommendations': 'സ്മാർട്ട് ശുപാർശകൾ',
    'What-If Simulator': 'സിമുലേറ്റർ',
    'Predictive Maintenance': 'പ്രവചന പരിപാലനം',
    'Water Quality Module': 'ജല ഗുണനിലവാര മൊഡ്യൂൾ',
    'Geo-Spatial Intelligence': 'ജിയോ-സ്പേഷ്യൽ ഇന്റലിജൻസ്',
    'Multi-Building Analytics': 'മൾട്ടി-ബിൽഡിംഗ് അനലിറ്റിക്സ്',
    'Sustainability & Impact': 'സുസ്ഥിരതയും സ്വാധീനവും',
    'Reports & AI Summary': 'റിപ്പോർട്ടുകളും AI സംഗ്രഹവും',
    'Sensor Fleet & Quality': 'സെൻസർ ഫ്ലീറ്റ്',
    'Security & Audit Trail': 'സുരക്ഷയും ഓഡിറ്റും',
    'Install Desktop App': 'ഡെസ്ക്ടോപ്പ് ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
    'AI Copilot': 'AI കോപൈലറ്റ്',
    'Flow:': 'ഒഴുക്ക്:',
    'Pressure:': 'മർദ്ദം:'
  },
  mr: {
    'Command Center': 'कमांड सेंटर',
    'Master Command Center': 'मास्टर कमांड सेंटर',
    'Real-Time Monitoring': 'रिअल-टाइम मॉनिटरिंग',
    'Digital Water Twin': 'डिजिटल वॉटर ट्विन',
    'Anomaly & Leak Risk': 'गळती आणि जोखीम केंद्र',
    'Forecast & Optimization': 'अंदाज आणि ऑप्टिमायझेशन',
    'Smart Recommendations': 'स्मार्ट शिफारसी',
    'What-If Simulator': 'सिम्युलेटर',
    'Predictive Maintenance': 'भविष्यसूचक देखभाल',
    'Water Quality Module': 'पाणी गुणवत्ता मॉड्यूल',
    'Geo-Spatial Intelligence': 'भू-स्थानिक बुद्धिमत्ता',
    'Multi-Building Analytics': 'मल्टी-बिल्डिंग अॅनालिटिक्स',
    'Sustainability & Impact': 'शाश्वतता आणि प्रभाव',
    'Reports & AI Summary': 'अहवाल आणि AI सारांश',
    'Sensor Fleet & Quality': 'सेन्सर फ्लीट',
    'Security & Audit Trail': 'सुरक्षा आणि ऑडिट',
    'Install Desktop App': 'डेस्कटॉप अॅप इन्स्टॉल करा',
    'AI Copilot': 'AI कोपायलट',
    'Flow:': 'प्रवाह:',
    'Pressure:': 'दाब:'
  },
  bn: {
    'Command Center': 'কমান্ড সেন্টার',
    'Master Command Center': 'মাস্টার কমান্ড সেন্টার',
    'Real-Time Monitoring': 'রিয়েল-টাইম মনিটরিং',
    'Digital Water Twin': 'ডিজিটাল ওয়াটার টুইন',
    'Anomaly & Leak Risk': 'লিক ও ঝুঁকি কেন্দ্র',
    'Forecast & Optimization': 'পূর্বাভাস ও অপ্টিমাইজেশন',
    'Smart Recommendations': 'স্মার্ট সুপারিশ',
    'What-If Simulator': 'সিমুলেটর',
    'Predictive Maintenance': 'পূর্বাভাসমূলক রক্ষণাবেক্ষণ',
    'Water Quality Module': 'জলের গুণমান মডিউল',
    'Geo-Spatial Intelligence': 'জিও-স্পেশিয়াল ইন্টেলিজেন্স',
    'Multi-Building Analytics': 'মাল্টি-বিল্ডিং অ্যানালিটিক্স',
    'Sustainability & Impact': 'স্থায়িত্ব ও প্রভাব',
    'Reports & AI Summary': 'রিপোর্ট ও এআই সারাংশ',
    'Sensor Fleet & Quality': 'সেন্সর ফ্লিট',
    'Security & Audit Trail': 'নিরাপত্তা ও অডিট',
    'Install Desktop App': 'ডেস্কটপ অ্যাপ ইনস্টল করুন',
    'AI Copilot': 'এআই কোপাইলট',
    'Flow:': 'প্রবাহ:',
    'Pressure:': 'চাপ:'
  },
  es: {
    'Command Center': 'Centro de Mando',
    'Master Command Center': 'Centro de Mando Maestro',
    'Real-Time Monitoring': 'Monitoreo en Tiempo Real',
    'Digital Water Twin': 'Gemelo Digital del Agua',
    'Anomaly & Leak Risk': 'Anomalías y Riesgo de Fugas',
    'Forecast & Optimization': 'Pronóstico y Optimización',
    'Smart Recommendations': 'Recomendaciones Inteligentes',
    'What-If Simulator': 'Simulador de Escenarios',
    'Predictive Maintenance': 'Mantenimiento Predictivo',
    'Water Quality Module': 'Módulo de Calidad del Agua',
    'Geo-Spatial Intelligence': 'Inteligencia Geoespacial',
    'Multi-Building Analytics': 'Analítica Multiedificio',
    'Sustainability & Impact': 'Sostenibilidad e Impacto',
    'Reports & AI Summary': 'Informes y Resumen IA',
    'Sensor Fleet & Quality': 'Flota de Sensores',
    'Security & Audit Trail': 'Seguridad y Auditoría',
    'Install Desktop App': 'Instalar App de Escritorio',
    'AI Copilot': 'Copiloto IA',
    'Flow:': 'Flujo:',
    'Pressure:': 'Presión:'
  },
  fr: {
    'Command Center': 'Centre de Commande',
    'Master Command Center': 'Centre de Commande Principal',
    'Real-Time Monitoring': 'Surveillance en Temps Réel',
    'Digital Water Twin': 'Jumeau Numérique de l’Eau',
    'Anomaly & Leak Risk': 'Anomalies et Risques de Fuite',
    'Forecast & Optimization': 'Prévisions et Optimisation',
    'Smart Recommendations': 'Recommandations Intelligentes',
    'What-If Simulator': 'Simulateur de Scénarios',
    'Predictive Maintenance': 'Maintenance Prédictive',
    'Water Quality Module': 'Qualité de l’Eau',
    'Geo-Spatial Intelligence': 'Intelligence Géospatiale',
    'Multi-Building Analytics': 'Analytique Multi-Bâtiments',
    'Sustainability & Impact': 'Durabilité et Impact',
    'Reports & AI Summary': 'Rapports et Résumé IA',
    'Sensor Fleet & Quality': 'Flotte de Capteurs',
    'Security & Audit Trail': 'Sécurité et Audit',
    'Install Desktop App': 'Installer l’App Bureau',
    'AI Copilot': 'Copilote IA',
    'Flow:': 'Débit:',
    'Pressure:': 'Pression:'
  },
  de: {
    'Command Center': 'Leitstelle',
    'Master Command Center': 'Haupt-Leitstelle',
    'Real-Time Monitoring': 'Echtzeit-Überwachung',
    'Digital Water Twin': 'Digitaler Wasser-Zwilling',
    'Anomaly & Leak Risk': 'Anomalie- & Leckagerisiko',
    'Forecast & Optimization': 'Prognose & Optimierung',
    'Smart Recommendations': 'Smarte Empfehlungen',
    'What-If Simulator': 'Was-wäre-wenn-Simulator',
    'Predictive Maintenance': 'Vorausschauende Wartung',
    'Water Quality Module': 'Wasserqualitätsmodul',
    'Geo-Spatial Intelligence': 'Geodaten-Intelligenz',
    'Multi-Building Analytics': 'Mehrgebäude-Analytik',
    'Sustainability & Impact': 'Nachhaltigkeit & Wirkung',
    'Reports & AI Summary': 'Berichte & KI-Zusammenfassung',
    'Sensor Fleet & Quality': 'Sensorflotte & Qualität',
    'Security & Audit Trail': 'Sicherheit & Audit-Trail',
    'Install Desktop App': 'Desktop-App installieren',
    'AI Copilot': 'KI-Copilot',
    'Flow:': 'Durchfluss:',
    'Pressure:': 'Druck:'
  },
  ja: {
    'Command Center': 'コマンドセンター',
    'Master Command Center': 'マスター指令センター',
    'Real-Time Monitoring': 'リアルタイム監視',
    'Digital Water Twin': 'デジタルウォーターツイン',
    'Anomaly & Leak Risk': '異常・漏水リスク',
    'Forecast & Optimization': '需要予測と最適化',
    'Smart Recommendations': 'スマート推奨アクション',
    'What-If Simulator': 'シミュレーション',
    'Predictive Maintenance': '予知保全',
    'Water Quality Module': '水質管理モジュール',
    'Geo-Spatial Intelligence': '地理空間インテリジェンス',
    'Multi-Building Analytics': '複数棟比較分析',
    'Sustainability & Impact': '持続可能性とESG',
    'Reports & AI Summary': '監査レポートとAI要約',
    'Sensor Fleet & Quality': 'センサー群管理',
    'Security & Audit Trail': 'セキュリティ監査履歴',
    'Install Desktop App': 'デスクトップアプリを導入',
    'AI Copilot': 'AIコパイロット',
    'Flow:': '流量:',
    'Pressure:': '水圧:'
  }
};

export interface LanguageContextType {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  currentLanguageOption: LanguageOption;
  isTranslatingPage: boolean;
  translatedNodesCount: number;
  t: (text: string) => string;
  retranslatePage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Original text storage for DOM text nodes so switching languages or returning to English is 100% lossless
const originalTextMap = new WeakMap<Text, string>();
const lastAppliedTranslationMap = new WeakMap<Text, string>();
const clientTranslationCache: Record<string, Record<string, string>> = {};

// Load any cached translations from localStorage
try {
  const savedCache = localStorage.getItem('jalrakshak_i18n_cache_v2');
  if (savedCache) {
    Object.assign(clientTranslationCache, JSON.parse(savedCache));
  }
} catch {
  // ignore
}

function shouldSkipTextNode(textNode: Text): boolean {
  const parent = textNode.parentElement;
  if (!parent) return true;
  const tag = parent.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'code' || tag === 'pre') {
    return true;
  }
  if (parent.closest('[data-no-translate="true"]')) {
    return true;
  }
  return false;
}

function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

function isPureNumericOrSymbol(str: string): boolean {
  return /^[\d\s.,:%+\-–—•/()°$₹#@|×~LPMlpmbarMLkWhdBHzmsvV]+$/.test(str);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => {
    const saved = localStorage.getItem('jalrakshak_language') as SupportedLanguageCode;
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    return 'en';
  });

  const [isTranslatingPage, setIsTranslatingPage] = useState(false);
  const [translatedNodesCount, setTranslatedNodesCount] = useState(0);
  const isApplyingDomChangesRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const activeLangRef = useRef<SupportedLanguageCode>(language);
  activeLangRef.current = language;

  const finishDomMutationPass = () => {
    if (observerRef.current) {
      observerRef.current.takeRecords();
    }
    queueMicrotask(() => {
      isApplyingDomChangesRef.current = false;
    });
  };

  const setLanguage = useCallback((newLang: SupportedLanguageCode) => {
    setLanguageState(newLang);
    localStorage.setItem('jalrakshak_language', newLang);
    document.documentElement.lang = newLang;
  }, []);

  // Direct synchronous translation helper for components using useLanguage().t(...)
  const t = useCallback(
    (text: string): string => {
      if (!text || language === 'en') return text;
      const norm = normalizeWhitespace(text);
      const dict = CORE_DICTIONARY[language];
      if (dict && dict[norm]) return dict[norm];
      const cached = clientTranslationCache[language]?.[norm];
      return cached || text;
    },
    [language]
  );

  const translateDomTree = useCallback(async (targetLang: SupportedLanguageCode) => {
    if (typeof document === 'undefined') return;
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    isApplyingDomChangesRef.current = true;

    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      const tNode = currentNode as Text;
      if (!shouldSkipTextNode(tNode)) {
        const currentVal = tNode.nodeValue || '';
        const lastApplied = lastAppliedTranslationMap.get(tNode);
        // If React updated this text node with new English content, capture the new original string
        if (!originalTextMap.has(tNode) || (lastApplied !== undefined && currentVal !== lastApplied)) {
          originalTextMap.set(tNode, currentVal);
        }
        textNodes.push(tNode);
      }
      currentNode = walker.nextNode();
    }

    // Also handle input placeholders and button/element title attributes
    const placeholderElements = rootEl.querySelectorAll<HTMLElement>('[placeholder]');
    placeholderElements.forEach((el) => {
      if (!el.hasAttribute('data-orig-placeholder')) {
        el.setAttribute('data-orig-placeholder', el.getAttribute('placeholder') || '');
      }
    });

    const titleElements = rootEl.querySelectorAll<HTMLElement>('[title]');
    titleElements.forEach((el) => {
      if (el.closest('[data-no-translate="true"]')) return;
      if (!el.hasAttribute('data-orig-title')) {
        el.setAttribute('data-orig-title', el.getAttribute('title') || '');
      }
    });

    // If English is selected, restore all original strings immediately
    if (targetLang === 'en') {
      for (const tNode of textNodes) {
        const orig = originalTextMap.get(tNode);
        if (orig !== undefined && tNode.nodeValue !== orig) {
          tNode.nodeValue = orig;
          lastAppliedTranslationMap.set(tNode, orig);
        }
      }
      placeholderElements.forEach((el) => {
        const origP = el.getAttribute('data-orig-placeholder');
        if (origP !== null) el.setAttribute('placeholder', origP);
      });
      titleElements.forEach((el) => {
        const origT = el.getAttribute('data-orig-title');
        if (origT !== null) el.setAttribute('title', origT);
      });
      finishDomMutationPass();
      setIsTranslatingPage(false);
      setTranslatedNodesCount(textNodes.length);
      return;
    }

    if (!clientTranslationCache[targetLang]) {
      clientTranslationCache[targetLang] = { ...(CORE_DICTIONARY[targetLang] || {}) };
    } else {
      Object.assign(clientTranslationCache[targetLang], CORE_DICTIONARY[targetLang] || {});
    }

    const langCache = clientTranslationCache[targetLang];
    const missingTextsSet = new Set<string>();
    const nodesNeedingAsyncUpdate: { node: Text; origRaw: string; norm: string }[] = [];
    let appliedCount = 0;

    // First synchronous pass from cache & core dictionary
    for (const tNode of textNodes) {
      const origRaw = originalTextMap.get(tNode) ?? (tNode.nodeValue || '');
      const norm = normalizeWhitespace(origRaw);
      if (!norm || isPureNumericOrSymbol(norm)) continue;

      if (langCache[norm]) {
        const leadingSpace = origRaw.match(/^\s*/)?.[0] || '';
        const trailingSpace = origRaw.match(/\s*$/)?.[0] || '';
        const nextVal = `${leadingSpace}${langCache[norm]}${trailingSpace}`;
        if (tNode.nodeValue !== nextVal) {
          tNode.nodeValue = nextVal;
        }
        lastAppliedTranslationMap.set(tNode, nextVal);
        appliedCount++;
      } else {
        missingTextsSet.add(norm);
        nodesNeedingAsyncUpdate.push({ node: tNode, origRaw, norm });
      }
    }

    placeholderElements.forEach((el) => {
      const origP = normalizeWhitespace(el.getAttribute('data-orig-placeholder') || '');
      if (!origP) return;
      if (langCache[origP]) {
        el.setAttribute('placeholder', langCache[origP]);
      } else {
        missingTextsSet.add(origP);
      }
    });

    titleElements.forEach((el) => {
      if (el.closest('[data-no-translate="true"]')) return;
      const origT = normalizeWhitespace(el.getAttribute('data-orig-title') || '');
      if (!origT) return;
      if (langCache[origT]) {
        el.setAttribute('title', langCache[origT]);
      } else {
        missingTextsSet.add(origT);
      }
    });

    finishDomMutationPass();
    setTranslatedNodesCount(appliedCount);

    const missingList = Array.from(missingTextsSet);
    if (missingList.length === 0) {
      return;
    }

    setIsTranslatingPage(true);

    // Fetch translations in parallel chunks so the entire page updates rapidly
    const chunkSize = 50;
    for (let i = 0; i < missingList.length; i += chunkSize) {
      if (activeLangRef.current !== targetLang) break;
      const chunk = missingList.slice(i, i + chunkSize);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: chunk, targetLang })
        });
        if (res.ok) {
          const data = await res.json();
          const translations: Record<string, string> = data?.translations || {};
          Object.assign(langCache, translations);
        }
      } catch {
        // ignore network hiccup
      }

      if (activeLangRef.current !== targetLang) break;

      isApplyingDomChangesRef.current = true;
      let updatedCount = appliedCount;
      for (const item of nodesNeedingAsyncUpdate) {
        const translated = langCache[item.norm];
        if (translated) {
          const leadingSpace = item.origRaw.match(/^\s*/)?.[0] || '';
          const trailingSpace = item.origRaw.match(/\s*$/)?.[0] || '';
          const nextVal = `${leadingSpace}${translated}${trailingSpace}`;
          if (item.node.nodeValue !== nextVal) {
            item.node.nodeValue = nextVal;
          }
          lastAppliedTranslationMap.set(item.node, nextVal);
          updatedCount++;
        }
      }

      placeholderElements.forEach((el) => {
        const origP = normalizeWhitespace(el.getAttribute('data-orig-placeholder') || '');
        if (origP && langCache[origP]) {
          el.setAttribute('placeholder', langCache[origP]);
        }
      });

      titleElements.forEach((el) => {
        if (el.closest('[data-no-translate="true"]')) return;
        const origT = normalizeWhitespace(el.getAttribute('data-orig-title') || '');
        if (origT && langCache[origT]) {
          el.setAttribute('title', langCache[origT]);
        }
      });

      setTranslatedNodesCount(updatedCount);
      finishDomMutationPass();
    }

    try {
      localStorage.setItem('jalrakshak_i18n_cache_v2', JSON.stringify(clientTranslationCache));
    } catch {
      // storage quota ignore
    }

    setIsTranslatingPage(false);
  }, []);

  const retranslatePage = useCallback(() => {
    translateDomTree(activeLangRef.current);
  }, [translateDomTree]);

  // Run full-page translation whenever language changes or DOM mutates (e.g. tab switch, modal open)
  useEffect(() => {
    translateDomTree(language);

    if (language === 'en') return;

    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    let debounceTimer: any = null;
    const observer = new MutationObserver(() => {
      if (isApplyingDomChangesRef.current) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (activeLangRef.current !== 'en' && !isApplyingDomChangesRef.current) {
          translateDomTree(activeLangRef.current);
        }
      }, 180);
    });

    observerRef.current = observer;
    observer.observe(rootEl, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [language, translateDomTree]);

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageOption,
        isTranslatingPage,
        translatedNodesCount,
        t,
        retranslatePage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
