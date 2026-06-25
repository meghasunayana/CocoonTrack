// src/components/VoiceAssistant.jsx

import React, { useEffect, useState, useMemo } from "react";
import useVoiceReader from "../hooks/useVoiceReader";

const VOICE_LANGS = [
  { code: "en", label: "EN",     native: "English" },
  { code: "kn", label: "ಕನ್ನಡ",  native: "Kannada" },
  { code: "te", label: "తెలుగు", native: "Telugu"  },
  { code: "ta", label: "தமிழ்",  native: "Tamil"   },
  { code: "hi", label: "हिंदी",  native: "Hindi"   },
];

// ── Complete pre-translated scripts for every class × every language ──────────
// Every word is translated. Values like numbers/percentages are kept as-is.
const SCRIPTS = {

  // ── SPINNING ────────────────────────────────────────────────────────────────
  spinning: {
    en: `Cocoon Analysis Result. Detected stage: Spinning in Progress. Confidence: {confidence} percent.
Stage Status: Silk deposition in progress. Worm is actively forming the cocoon shell.
Shell Completeness: Estimated 10 to 30 percent. Outer layer not yet sealed.
Days Since Spinning: Day 0 to 2, estimated. Based on shell formation visible.
Days to Harvest: 5 to 7 days remaining. Under optimal 26 degrees Celsius, 75 percent humidity.
Disturbance Risk: HIGH — Critical phase. Any contact can break thread continuity.
Recommended Action: Observe only. Do not touch. Maintain rearing room silence and stable environment.
Advice: Check environment monitor. Ensure temperature is 25 to 27 degrees Celsius and humidity 70 to 80 percent for optimal spinning.
Field Tip: This is the most sensitive phase. Even vibrations from footsteps can affect silk thread quality.`,

    kn: `ಕೋಕೂನ್ ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ. ಪತ್ತೆಯಾದ ಹಂತ: ನೂಲುವಿಕೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ. ವಿಶ್ವಾಸ: {confidence} ಶೇಕಡಾ.
ಹಂತದ ಸ್ಥಿತಿ: ರೇಷ್ಮೆ ಶೇಖರಣೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ. ಹುಳು ಸಕ್ರಿಯವಾಗಿ ಕೋಕೂನ್ ಕವಚವನ್ನು ರೂಪಿಸುತ್ತಿದೆ.
ಕವಚದ ಪೂರ್ಣತೆ: ಅಂದಾಜು 10 ರಿಂದ 30 ಶೇಕಡಾ. ಹೊರ ಪದರ ಇನ್ನೂ ಮುಚ್ಚಿಲ್ಲ.
ನೂಲುವ ದಿನಗಳು: ದಿನ 0 ರಿಂದ 2, ಅಂದಾಜು. ಕವಚ ರಚನೆ ಗೋಚರವಾಗಿದೆ.
ಕಟಾವಿಗೆ ದಿನಗಳು: 5 ರಿಂದ 7 ದಿನಗಳು ಉಳಿದಿವೆ. ಸೂಕ್ತ 26 ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್, 75 ಶೇಕಡಾ ತೇವಾಂಶದಲ್ಲಿ.
ತೊಂದರೆ ಅಪಾಯ: ಅಧಿಕ — ನಿರ್ಣಾಯಕ ಹಂತ. ಯಾವುದೇ ಸ್ಪರ್ಶ ದಾರದ ನಿರಂತರತೆಯನ್ನು ಮುರಿಯಬಹುದು.
ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ: ಗಮನಿಸಿ ಮಾತ್ರ. ಮುಟ್ಟಬೇಡಿ. ಸಾಕಣೆ ಕೊಠಡಿಯಲ್ಲಿ ಮೌನ ಮತ್ತು ಸ್ಥಿರ ವಾತಾವರಣ ಕಾಪಾಡಿ.
ಸಲಹೆ: ಪರಿಸರ ಮೇಲ್ವಿಚಾರಣೆ ಪರಿಶೀಲಿಸಿ. ತಾಪಮಾನ 25 ರಿಂದ 27 ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ಮತ್ತು ತೇವಾಂಶ 70 ರಿಂದ 80 ಶೇಕಡಾ ಇರುವಂತೆ ಖಚಿತಪಡಿಸಿ.
ಕ್ಷೇತ್ರ ಸಲಹೆ: ಇದು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಂತ. ಹೆಜ್ಜೆಗಳ ಕಂಪನಗಳೂ ರೇಷ್ಮೆ ದಾರದ ಗುಣಮಟ್ಟದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು.`,

    te: `కోకూన్ విశ్లేషణ ఫలితం. గుర్తించిన దశ: స్పిన్నింగ్ పురోగతిలో ఉంది. నమ్మకం: {confidence} శాతం.
దశ స్థితి: సిల్క్ నిక్షేపణ పురోగతిలో ఉంది. పురుగు చురుకుగా కోకూన్ పెంకును ఏర్పరుస్తోంది.
షెల్ పూర్ణత: అంచనా 10 నుండి 30 శాతం. బయటి పొర ఇంకా మూసుకోలేదు.
స్పిన్నింగ్ తర్వాత రోజులు: రోజు 0 నుండి 2, అంచనా. పెంకు ఏర్పాటు కనిపిస్తోంది.
పంట రోజులు: 5 నుండి 7 రోజులు మిగిలాయి. సరైన 26 డిగ్రీల సెల్సియస్, 75 శాతం తేమలో.
అంతరాయ ప్రమాదం: అధికం — క్లిష్టమైన దశ. ఏ స్పర్శ అయినా దారం కొనసాగింపును విరిచివేయవచ్చు.
సిఫార్సు చర్య: గమనించండి మాత్రమే. తాకవద్దు. పెంపకం గది మౌనం మరియు స్థిర వాతావరణం నిర్వహించండి.
సలహా: పర్యావరణ మానిటర్ తనిఖీ చేయండి. ఉష్ణోగ్రత 25 నుండి 27 డిగ్రీల సెల్సియస్ మరియు తేమ 70 నుండి 80 శాతం ఉండేలా నిర్ధారించుకోండి.
క్షేత్ర చిట్కా: ఇది అత్యంత సున్నితమైన దశ. అడుగుల కంపనాలు కూడా సిల్క్ దారం నాణ్యతను ప్రభావితం చేయవచ్చు.`,

    ta: `கூட்டுப்புழு பகுப்பாய்வு முடிவு. கண்டறியப்பட்ட நிலை: நூற்பு நடந்துகொண்டிருக்கிறது. நம்பகத்தன்மை: {confidence} சதவீதம்.
நிலை நிலைமை: பட்டு படிவு நடந்துகொண்டிருக்கிறது. புழு தீவிரமாக கூட்டுப்புழு ஓட்டை உருவாக்குகிறது.
ஓட்டு முழுமை: மதிப்பிடப்பட்ட 10 முதல் 30 சதவீதம். வெளி அடுக்கு இன்னும் மூடவில்லை.
நூற்பு நாட்கள்: நாள் 0 முதல் 2, மதிப்பிடப்பட்டது. ஓட்டு உருவாக்கம் தெரிகிறது.
அறுவடை நாட்கள்: 5 முதல் 7 நாட்கள் மீதமுள்ளன. சரியான 26 டிகிரி செல்சியஸ், 75 சதவீத ஈரப்பதத்தில்.
தொந்தரவு ஆபத்து: அதிகம் — முக்கியமான கட்டம். எந்த தொடுதலும் நூல் தொடர்ச்சியை முறிக்கலாம்.
பரிந்துரைக்கப்பட்ட நடவடிக்கை: கவனிக்கவும் மட்டுமே. தொடவேண்டாம். வளர்ப்பு அறையில் அமைதி மற்றும் நிலையான சூழல் பராமரிக்கவும்.
ஆலோசனை: சுற்றுச்சூழல் கண்காணிப்பை சரிபார்க்கவும். வெப்பநிலை 25 முதல் 27 டிகிரி செல்சியஸ் மற்றும் ஈரப்பதம் 70 முதல் 80 சதவீதம் இருப்பதை உறுதிப்படுத்தவும்.
வயல் குறிப்பு: இது மிகவும் உணர்திறன் வாய்ந்த கட்டம். கால் அடிகளின் அதிர்வுகள் கூட பட்டு நூல் தரத்தை பாதிக்கலாம்.`,

    hi: `कोकून विश्लेषण परिणाम. पहचाना गया चरण: कताई प्रगति में है. विश्वास: {confidence} प्रतिशत.
चरण स्थिति: रेशम जमाव प्रगति में है. कीड़ा सक्रिय रूप से कोकून खोल बना रहा है.
खोल की पूर्णता: अनुमानित 10 से 30 प्रतिशत. बाहरी परत अभी तक सील नहीं हुई.
कताई के बाद के दिन: दिन 0 से 2, अनुमानित. खोल निर्माण दिखाई दे रहा है.
कटाई के दिन: 5 से 7 दिन शेष. सर्वोत्तम 26 डिग्री सेल्सियस, 75 प्रतिशत नमी में.
व्यवधान जोखिम: अधिक — महत्वपूर्ण चरण. कोई भी संपर्क धागे की निरंतरता तोड़ सकता है.
अनुशंसित कार्रवाई: केवल देखें. छुएं नहीं. पालन कक्ष में मौन और स्थिर वातावरण बनाए रखें.
सलाह: पर्यावरण मॉनिटर जांचें. सुनिश्चित करें कि तापमान 25 से 27 डिग्री सेल्सियस और नमी 70 से 80 प्रतिशत हो.
खेत सुझाव: यह सबसे संवेदनशील चरण है. पैरों की कंपन भी रेशम धागे की गुणवत्ता को प्रभावित कर सकती है.`,
  },

  // ── DEVELOPING ──────────────────────────────────────────────────────────────
  developing: {
    en: `Cocoon Analysis Result. Detected stage: Developing — Not Yet Ready. Confidence: {confidence} percent.
Stage Status: Shell forming — pupa maturing. Silk layer thickening, pupa transitioning inside.
Shell Completeness: Estimated 50 to 75 percent. Shell partially opaque, still soft.
Days Since Spinning: Day 3 to 5, estimated. Mid-stage cocoon formation.
Days to Harvest: 2 to 3 days remaining. Approaching optimal harvest window.
Preliminary Quality Signal: Shape and size developing normally. No visible defects detected at this stage.
Risk Factor: Moderate — monitor humidity. Low humidity now causes thin shell and reduced filament.
Advice: Log today's environment reading. Humidity drop below 65 percent at this stage reduces filament quality significantly.
Field Tip: Maintain steady humidity between 70 to 85 percent during this stage. Sudden drops are the leading cause of thin-shelled cocoons.`,

    kn: `ಕೋಕೂನ್ ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ. ಪತ್ತೆಯಾದ ಹಂತ: ಅಭಿವೃದ್ಧಿಯಾಗುತ್ತಿದೆ — ಇನ್ನೂ ಸಿದ್ಧವಿಲ್ಲ. ವಿಶ್ವಾಸ: {confidence} ಶೇಕಡಾ.
ಹಂತದ ಸ್ಥಿತಿ: ಕವಚ ರೂಪುಗೊಳ್ಳುತ್ತಿದೆ — ಕೋಶ ಪಕ್ವವಾಗುತ್ತಿದೆ. ರೇಷ್ಮೆ ಪದರ ದಪ್ಪವಾಗುತ್ತಿದೆ, ಒಳಗೆ ಕೋಶ ಪರಿವರ್ತನೆಯಾಗುತ್ತಿದೆ.
ಕವಚದ ಪೂರ್ಣತೆ: ಅಂದಾಜು 50 ರಿಂದ 75 ಶೇಕಡಾ. ಕವಚ ಭಾಗಶಃ ಅಪಾರದರ್ಶಕ, ಇನ್ನೂ ಮೃದು.
ನೂಲುವ ದಿನಗಳು: ದಿನ 3 ರಿಂದ 5, ಅಂದಾಜು. ಮಧ್ಯಂತರ ಕೋಕೂನ್ ರಚನೆ.
ಕಟಾವಿಗೆ ದಿನಗಳು: 2 ರಿಂದ 3 ದಿನಗಳು ಉಳಿದಿವೆ. ಸೂಕ್ತ ಕಟಾವು ಅವಧಿ ಸಮೀಪಿಸುತ್ತಿದೆ.
ಪ್ರಾಥಮಿಕ ಗುಣಮಟ್ಟದ ಸಂಕೇತ: ಆಕಾರ ಮತ್ತು ಗಾತ್ರ ಸಾಮಾನ್ಯವಾಗಿ ಅಭಿವೃದ್ಧಿಯಾಗುತ್ತಿದೆ. ಈ ಹಂತದಲ್ಲಿ ಯಾವುದೇ ದೃಶ್ಯ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
ಅಪಾಯದ ಅಂಶ: ಮಧ್ಯಮ — ತೇವಾಂಶ ಮೇಲ್ವಿಚಾರಿಸಿ. ಕಡಿಮೆ ತೇವಾಂಶ ತೆಳು ಕವಚ ಮತ್ತು ಕಡಿಮೆ ತಂತುವಿಗೆ ಕಾರಣವಾಗುತ್ತದೆ.
ಸಲಹೆ: ಇಂದಿನ ಪರಿಸರ ಓದನ್ನು ದಾಖಲಿಸಿ. ಈ ಹಂತದಲ್ಲಿ ತೇವಾಂಶ 65 ಶೇಕಡಾಕ್ಕಿಂತ ಕಡಿಮೆಯಾದರೆ ತಂತುವಿನ ಗುಣಮಟ್ಟ ಗಮನಾರ್ಹವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.
ಕ್ಷೇತ್ರ ಸಲಹೆ: ಈ ಹಂತದಲ್ಲಿ ತೇವಾಂಶ 70 ರಿಂದ 85 ಶೇಕಡಾ ನಡುವೆ ಸ್ಥಿರವಾಗಿ ಇರಿಸಿ. ಹಠಾತ್ ಇಳಿಕೆ ತೆಳು ಕವಚದ ಕೋಕೂನ್‌ಗಳ ಪ್ರಮುಖ ಕಾರಣ.`,

    te: `కోకూన్ విశ్లేషణ ఫలితం. గుర్తించిన దశ: అభివృద్ధి చెందుతోంది — ఇంకా సిద్ధంగా లేదు. నమ్మకం: {confidence} శాతం.
దశ స్థితి: పెంకు ఏర్పడుతోంది — గొంగళి పురుగు పరిపక్వమవుతోంది. సిల్క్ పొర మందంగా అవుతోంది, లోపల పరివర్తన చెందుతోంది.
షెల్ పూర్ణత: అంచనా 50 నుండి 75 శాతం. పెంకు పాక్షికంగా అపారదర్శకంగా, ఇంకా మెత్తగా ఉంది.
స్పిన్నింగ్ తర్వాత రోజులు: రోజు 3 నుండి 5, అంచనా. మధ్య దశ కోకూన్ నిర్మాణం.
పంట రోజులు: 2 నుండి 3 రోజులు మిగిలాయి. సరైన పంట విండో దగ్గరపడుతోంది.
ప్రాథమిక నాణ్యత సంకేతం: ఆకారం మరియు పరిమాణం సాధారణంగా అభివృద్ధి చెందుతోంది. ఈ దశలో ఏ లోపాలూ కనిపించలేదు.
ప్రమాద కారకం: మధ్యస్థం — తేమ పర్యవేక్షించండి. తక్కువ తేమ ఇప్పుడు సన్నని పెంకు మరియు తగ్గిన ఫిలమెంట్‌కు కారణమవుతుంది.
సలహా: నేటి పర్యావరణ పఠనాన్ని నమోదు చేయండి. ఈ దశలో తేమ 65 శాతం కంటే తక్కువగా పడిపోతే ఫిలమెంట్ నాణ్యత గణనీయంగా తగ్గుతుంది.
క్షేత్ర చిట్కా: ఈ దశలో తేమను 70 నుండి 85 శాతం మధ్య స్థిరంగా నిర్వహించండి. హఠాత్తు పతనాలు సన్నని పెంకు కోకూన్‌లకు ప్రధాన కారణం.`,

    ta: `கூட்டுப்புழு பகுப்பாய்வு முடிவு. கண்டறியப்பட்ட நிலை: வளர்ச்சியடைகிறது — இன்னும் தயாரில்லை. நம்பகத்தன்மை: {confidence} சதவீதம்.
நிலை நிலைமை: ஓடு உருவாகுகிறது — கூட்டுப்புழு முதிர்கிறது. பட்டு அடுக்கு தடிமனாகுகிறது, உள்ளே மாற்றம் நிகழ்கிறது.
ஓட்டு முழுமை: மதிப்பிடப்பட்ட 50 முதல் 75 சதவீதம். ஓடு பகுதியளவு ஒளிபுகாதது, இன்னும் மென்மையாக உள்ளது.
நூற்பு நாட்கள்: நாள் 3 முதல் 5, மதிப்பிடப்பட்டது. நடு கட்ட கூட்டுப்புழு உருவாக்கம்.
அறுவடை நாட்கள்: 2 முதல் 3 நாட்கள் மீதமுள்ளன. சரியான அறுவடை சாளரம் நெருங்குகிறது.
முன்னோட்ட தர சமிக்ஞை: வடிவம் மற்றும் அளவு இயல்பாக வளர்கிறது. இந்த நிலையில் எந்த குறைபாடும் கண்டறியப்படவில்லை.
ஆபத்து காரணி: மிதமானது — ஈரப்பதம் கண்காணிக்கவும். குறைந்த ஈரப்பதம் இப்போது மெல்லிய ஓடு மற்றும் குறைந்த நூலுக்கு காரணமாகிறது.
ஆலோசனை: இன்றைய சுற்றுச்சூழல் அளவீட்டை பதிவு செய்யுங்கள். இந்த நிலையில் ஈரப்பதம் 65 சதவீதத்திற்கு கீழே குறைந்தால் நூல் தரம் கணிசமாக குறையும்.
வயல் குறிப்பு: இந்த நிலையில் ஈரப்பதத்தை 70 முதல் 85 சதவீதம் வரை நிலையாக பராமரிக்கவும். திடீர் குறைவுகள் மெல்லிய ஓடு கூட்டுப்புழுக்களின் முக்கிய காரணம்.`,

    hi: `कोकून विश्लेषण परिणाम. पहचाना गया चरण: विकास हो रहा है — अभी तैयार नहीं. विश्वास: {confidence} प्रतिशत.
चरण स्थिति: खोल बन रहा है — प्यूपा परिपक्व हो रहा है. रेशम की परत मोटी हो रही है, अंदर परिवर्तन हो रहा है.
खोल की पूर्णता: अनुमानित 50 से 75 प्रतिशत. खोल आंशिक रूप से अपारदर्शी, अभी भी मुलायम.
कताई के बाद के दिन: दिन 3 से 5, अनुमानित. मध्य-चरण कोकून निर्माण.
कटाई के दिन: 2 से 3 दिन शेष. सर्वोत्तम कटाई खिड़की नजदीक आ रही है.
प्रारंभिक गुणवत्ता संकेत: आकार और आकृति सामान्य रूप से विकसित हो रही है. इस चरण में कोई दृश्य दोष नहीं मिला.
जोखिम कारक: मध्यम — नमी पर नजर रखें. कम नमी अभी पतले खोल और कम फिलामेंट का कारण बनती है.
सलाह: आज की पर्यावरण रीडिंग दर्ज करें. इस चरण में नमी 65 प्रतिशत से नीचे गिरने पर फिलामेंट की गुणवत्ता काफी कम हो जाती है.
खेत सुझाव: इस चरण में नमी 70 से 85 प्रतिशत के बीच स्थिर रखें. अचानक गिरावट पतले खोल वाले कोकून का मुख्य कारण है.`,
  },

  // ── READY ───────────────────────────────────────────────────────────────────
  ready: {
    en: `Cocoon Analysis Result. Detected stage: Ready for Harvest. Confidence: {confidence} percent.
Stage Status: Optimal harvest condition. Pupa fully formed, shell dense and sealed.
Shell Completeness: 100 percent — fully sealed. Maximum filament continuity achieved.
Visual Quality Indicators: Uniform shape, clean surface, dense shell. Consistent colour, no deformities detected.
Harvest Window: ACTIVE — 24 to 48 hours. Delay beyond 2 days risks overdue classification.
Estimated Filament Condition: Good — continuous thread likely. Shell density suggests high reeling suitability.
Batch Readiness: Proceed to harvest planning. Cross-check batch log before market visit.
Advice: Update your batch harvest log now. Check market prices and nearby markets before you travel.
Field Tip: Harvest in the early morning, 6 to 8 AM, when temperatures are lower. This preserves filament quality during transport.`,

    kn: `ಕೋಕೂನ್ ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ. ಪತ್ತೆಯಾದ ಹಂತ: ಕಟಾವಿಗೆ ಸಿದ್ಧ. ವಿಶ್ವಾಸ: {confidence} ಶೇಕಡಾ.
ಹಂತದ ಸ್ಥಿತಿ: ಸೂಕ್ತ ಕಟಾವು ಸ್ಥಿತಿ. ಕೋಶ ಸಂಪೂರ್ಣ ರೂಪುಗೊಂಡಿದೆ, ಕವಚ ದಟ್ಟ ಮತ್ತು ಮುಚ್ಚಲ್ಪಟ್ಟಿದೆ.
ಕವಚದ ಪೂರ್ಣತೆ: 100 ಶೇಕಡಾ — ಸಂಪೂರ್ಣ ಮುಚ್ಚಲ್ಪಟ್ಟಿದೆ. ಗರಿಷ್ಠ ತಂತು ನಿರಂತರತೆ ಸಾಧಿಸಲಾಗಿದೆ.
ದೃಶ್ಯ ಗುಣಮಟ್ಟ ಸೂಚಕಗಳು: ಏಕರೂಪ ಆಕಾರ, ಸ್ವಚ್ಛ ಮೇಲ್ಮೈ, ದಟ್ಟ ಕವಚ. ಒಂದೇ ಬಣ್ಣ, ಯಾವುದೇ ವಿಕೃತಿ ಕಂಡುಬಂದಿಲ್ಲ.
ಕಟಾವು ಅವಧಿ: ಸಕ್ರಿಯ — 24 ರಿಂದ 48 ಗಂಟೆಗಳು. 2 ದಿನಗಳ ವಿಳಂಬ ಅತಿಗಾಲ ವರ್ಗೀಕರಣದ ಅಪಾಯ.
ಅಂದಾಜು ತಂತು ಸ್ಥಿತಿ: ಉತ್ತಮ — ನಿರಂತರ ದಾರ ಸಂಭವನೀಯ. ಕವಚದ ಸಾಂದ್ರತೆ ಹೆಚ್ಚಿನ ರೀಲಿಂಗ್ ಯೋಗ್ಯತೆ ಸೂಚಿಸುತ್ತದೆ.
ಬ್ಯಾಚ್ ಸಿದ್ಧತೆ: ಕಟಾವು ಯೋಜನೆಗೆ ಮುಂದುವರಿಯಿರಿ. ಮಾರುಕಟ್ಟೆ ಭೇಟಿ ಮೊದಲು ಬ್ಯಾಚ್ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ.
ಸಲಹೆ: ಈಗ ನಿಮ್ಮ ಬ್ಯಾಚ್ ಕಟಾವು ದಾಖಲೆ ನವೀಕರಿಸಿ. ಪ್ರಯಾಣ ಮೊದಲು ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮತ್ತು ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.
ಕ್ಷೇತ್ರ ಸಲಹೆ: ಬೆಳಿಗ್ಗೆ 6 ರಿಂದ 8 ಗಂಟೆ ನಡುವೆ ಕಟಾವು ಮಾಡಿ, ತಾಪಮಾನ ಕಡಿಮೆ ಇರುವಾಗ. ಇದು ಸಾಗಣೆ ಸಮಯದಲ್ಲಿ ತಂತುವಿನ ಗುಣಮಟ್ಟ ಕಾಪಾಡುತ್ತದೆ.`,

    te: `కోకూన్ విశ్లేషణ ఫలితం. గుర్తించిన దశ: పంటకు సిద్ధంగా ఉంది. నమ్మకం: {confidence} శాతం.
దశ స్థితి: సరైన పంట స్థితి. గొంగళి పురుగు పూర్తిగా ఏర్పడింది, పెంకు దట్టంగా మరియు మూసుకుపోయింది.
షెల్ పూర్ణత: 100 శాతం — పూర్తిగా మూసుకుంది. గరిష్ట ఫిలమెంట్ కొనసాగింపు సాధించబడింది.
దృశ్య నాణ్యత సూచికలు: ఏకరీతి ఆకారం, శుభ్రమైన ఉపరితలం, దట్టమైన పెంకు. ఒకే రంగు, ఎటువంటి వైకల్యాలు కనిపించలేదు.
పంట విండో: క్రియాశీలం — 24 నుండి 48 గంటలు. 2 రోజులకు మించిన ఆలస్యం గడువు తీరిన వర్గీకరణ ప్రమాదం.
అంచనా ఫిలమెంట్ స్థితి: మంచిది — నిరంతర దారం సంభావ్యం. పెంకు సాంద్రత అధిక రీలింగ్ అనుకూలతను సూచిస్తుంది.
బ్యాచ్ సంసిద్ధత: పంట ప్రణాళికకు కొనసాగండి. మార్కెట్ సందర్శనకు ముందు బ్యాచ్ లాగ్ తనిఖీ చేయండి.
సలహా: ఇప్పుడే మీ బ్యాచ్ పంట లాగ్ అప్‌డేట్ చేయండి. ప్రయాణానికి ముందు మార్కెట్ ధరలు మరియు సమీప మార్కెట్లు తనిఖీ చేయండి.
క్షేత్ర చిట్కా: ఉదయం 6 నుండి 8 గంటల మధ్య పంట చేయండి, ఉష్ణోగ్రతలు తక్కువగా ఉన్నప్పుడు. ఇది రవాణా సమయంలో ఫిలమెంట్ నాణ్యతను కాపాడుతుంది.`,

    ta: `கூட்டுப்புழு பகுப்பாய்வு முடிவு. கண்டறியப்பட்ட நிலை: அறுவடைக்கு தயார். நம்பகத்தன்மை: {confidence} சதவீதம்.
நிலை நிலைமை: சரியான அறுவடை நிலை. கூட்டுப்புழு முழுமையாக உருவானது, ஓடு அடர்த்தியாகவும் மூடப்பட்டும் உள்ளது.
ஓட்டு முழுமை: 100 சதவீதம் — முழுமையாக மூடப்பட்டது. அதிகபட்ச நூல் தொடர்ச்சி அடையப்பட்டது.
காட்சி தர குறிகாட்டிகள்: சீரான வடிவம், சுத்தமான மேற்பரப்பு, அடர்த்தியான ஓடு. ஒரே நிறம், எந்த குறைபாடும் கண்டறியப்படவில்லை.
அறுவடை சாளரம்: செயலில் உள்ளது — 24 முதல் 48 மணி நேரம். 2 நாட்களுக்கு மேல் தாமதிப்பது காலம் தாழ்ந்த வகைப்பாட்டு அபாயம்.
மதிப்பிடப்பட்ட நூல் நிலை: நல்லது — தொடர்ச்சியான நூல் சாத்தியம். ஓட்டு அடர்த்தி அதிக சுருட்டு தகுதியை சுட்டுகிறது.
தொகுதி தயார்நிலை: அறுவடை திட்டமிடலுக்கு தொடரவும். சந்தை வருகைக்கு முன் தொகுதி பதிவை சரிபார்க்கவும்.
ஆலோசனை: இப்போதே உங்கள் தொகுதி அறுவடை பதிவை புதுப்பிக்கவும். பயணிக்கும் முன் சந்தை விலைகள் மற்றும் அருகிலுள்ள சந்தைகளை சரிபார்க்கவும்.
வயல் குறிப்பு: காலை 6 முதல் 8 மணிக்கு இடையில் அறுவடை செய்யுங்கள், வெப்பநிலை குறைவாக இருக்கும்போது. இது போக்குவரத்தின் போது நூல் தரத்தை பாதுகாக்கும்.`,

    hi: `कोकून विश्लेषण परिणाम. पहचाना गया चरण: कटाई के लिए तैयार. विश्वास: {confidence} प्रतिशत.
चरण स्थिति: सर्वोत्तम कटाई की स्थिति. प्यूपा पूरी तरह से बना है, खोल घना और सील है.
खोल की पूर्णता: 100 प्रतिशत — पूरी तरह सील. अधिकतम फिलामेंट निरंतरता प्राप्त हुई.
दृश्य गुणवत्ता संकेतक: एकसमान आकार, साफ सतह, घना खोल. एक समान रंग, कोई विकृति नहीं मिली.
कटाई की अवधि: सक्रिय — 24 से 48 घंटे. 2 दिन से अधिक देरी से अतिदेय वर्गीकरण का खतरा.
अनुमानित फिलामेंट स्थिति: अच्छा — निरंतर धागा संभावित. खोल की घनत्व उच्च रीलिंग उपयुक्तता सुझाती है.
बैच तैयारी: कटाई योजना के लिए आगे बढ़ें. बाजार जाने से पहले बैच लॉग जांचें.
सलाह: अभी अपना बैच कटाई लॉग अपडेट करें. यात्रा से पहले बाजार की कीमतें और नजदीकी बाजार जांचें.
खेत सुझाव: सुबह 6 से 8 बजे के बीच कटाई करें, जब तापमान कम होता है. यह परिवहन के दौरान फिलामेंट की गुणवत्ता बनाए रखता है.`,
  },

  // ── OVERDUE ─────────────────────────────────────────────────────────────────
  overdue: {
    en: `Cocoon Analysis Result. Detected stage: Overdue — Harvest Immediately. Confidence: {confidence} percent.
Stage Status: Post-optimal — pupa deteriorating. Harvest window has closed. Pupa drying inside.
Shell Condition: Darkened, slightly papery. Moisture lost from shell — surface appears dull.
Filament Impact: Reduced — increased breakage risk. Thread length shorter than at peak harvest.
Estimated Delay: 2 to 4 days beyond optimal window. Based on shell discolouration and texture analysis.
Urgency Level: HARVEST TODAY. Further delay reduces saleable value significantly.
Likely Cause: Missed harvest window. Consider enabling harvest reminder in next batch.
Advice: Harvest immediately. Update batch status to harvested. The app will show adjusted market expectations based on condition.
Field Tip: For future batches, set a harvest reminder alert in the batch screen once your cocoons enter the spinning stage.`,

    kn: `ಕೋಕೂನ್ ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ. ಪತ್ತೆಯಾದ ಹಂತ: ಅತಿಗಾಲ — ತಕ್ಷಣ ಕಟಾವು ಮಾಡಿ. ವಿಶ್ವಾಸ: {confidence} ಶೇಕಡಾ.
ಹಂತದ ಸ್ಥಿತಿ: ಸೂಕ್ತ ಸಮಯ ಮೀರಿದೆ — ಕೋಶ ಹಾಳಾಗುತ್ತಿದೆ. ಕಟಾವು ಅವಧಿ ಮುಚ್ಚಿದೆ. ಒಳಗೆ ಕೋಶ ಒಣಗುತ್ತಿದೆ.
ಕವಚ ಸ್ಥಿತಿ: ಕಪ್ಪಾಗಿದೆ, ಸ್ವಲ್ಪ ಕಾಗದದಂತಿದೆ. ಕವಚದಿಂದ ತೇವಾಂಶ ಕಳೆದಿದೆ — ಮೇಲ್ಮೈ ನಿಸ್ತೇಜವಾಗಿದೆ.
ತಂತು ಪರಿಣಾಮ: ಕಡಿಮೆಯಾಗಿದೆ — ಹೆಚ್ಚಿದ ಮುರಿತ ಅಪಾಯ. ದಾರದ ಉದ್ದ ಗರಿಷ್ಠ ಕಟಾವಿಗಿಂತ ಕಡಿಮೆ.
ಅಂದಾಜು ವಿಳಂಬ: ಸೂಕ್ತ ಅವಧಿ ಮೀರಿ 2 ರಿಂದ 4 ದಿನಗಳು. ಕವಚದ ಬಣ್ಣ ಮಾರ್ಪಾಡು ಮತ್ತು ವಿನ್ಯಾಸ ವಿಶ್ಲೇಷಣೆ ಆಧಾರದ ಮೇಲೆ.
ತುರ್ತು ಮಟ್ಟ: ಇಂದೇ ಕಟಾವು ಮಾಡಿ. ಮತ್ತಷ್ಟು ವಿಳಂಬ ಮಾರಾಟ ಮೌಲ್ಯವನ್ನು ಗಮನಾರ್ಹವಾಗಿ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.
ಸಂಭಾವ್ಯ ಕಾರಣ: ಕಟಾವು ಅವಧಿ ತಪ್ಪಿಹೋಗಿದೆ. ಮುಂದಿನ ಬ್ಯಾಚ್‌ನಲ್ಲಿ ಕಟಾವು ಜ್ಞಾಪಕ ಸಕ್ರಿಯಗೊಳಿಸಲು ಪರಿಗಣಿಸಿ.
ಸಲಹೆ: ತಕ್ಷಣ ಕಟಾವು ಮಾಡಿ. ಬ್ಯಾಚ್ ಸ್ಥಿತಿ ಕಟಾವು ಆಗಿ ನವೀಕರಿಸಿ. ಅಪ್ಲಿಕೇಶನ್ ಸ್ಥಿತಿ ಆಧಾರದ ಮೇಲೆ ಸರಿಹೊಂದಿಸಿದ ಮಾರುಕಟ್ಟೆ ನಿರೀಕ್ಷೆಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.
ಕ್ಷೇತ್ರ ಸಲಹೆ: ಭವಿಷ್ಯದ ಬ್ಯಾಚ್‌ಗಳಿಗೆ, ನಿಮ್ಮ ಕೋಕೂನ್‌ಗಳು ನೂಲುವ ಹಂತಕ್ಕೆ ಪ್ರವೇಶಿಸಿದ ನಂತರ ಬ್ಯಾಚ್ ಪರದೆಯಲ್ಲಿ ಕಟಾವು ಜ್ಞಾಪಕ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ.`,

    te: `కోకూన్ విశ్లేషణ ఫలితం. గుర్తించిన దశ: గడువు తీరింది — వెంటనే పంట చేయండి. నమ్మకం: {confidence} శాతం.
దశ స్థితి: గరిష్ట సమయం దాటింది — గొంగళి పురుగు క్షీణిస్తోంది. పంట విండో మూసుకుపోయింది. లోపల ఎండిపోతోంది.
పెంకు స్థితి: చీకటి పడింది, కొంచెం కాగితంలా ఉంది. పెంకు నుండి తేమ పోయింది — ఉపరితలం నిస్తేజంగా కనిపిస్తోంది.
ఫిలమెంట్ ప్రభావం: తగ్గింది — పెరిగిన తెగిపోవడం ప్రమాదం. దారం పొడవు గరిష్ట పంట కంటే తక్కువ.
అంచనా ఆలస్యం: సరైన విండో దాటి 2 నుండి 4 రోజులు. పెంకు రంగు మారడం మరియు ఆకృతి విశ్లేషణ ఆధారంగా.
అత్యవసర స్థాయి: ఈరోజే పంట చేయండి. మరింత ఆలస్యం అమ్మకపు విలువను గణనీయంగా తగ్గిస్తుంది.
సంభావ్య కారణం: పంట విండో మిస్ అయింది. తదుపరి బ్యాచ్‌లో పంట రిమైండర్ ప్రారంభించడం పరిశీలించండి.
సలహా: వెంటనే పంట చేయండి. బ్యాచ్ స్థితిని పంట చేయబడినట్లు అప్‌డేట్ చేయండి. యాప్ స్థితి ఆధారంగా సర్దుబాటు చేసిన మార్కెట్ అంచనాలు చూపిస్తుంది.
క్షేత్ర చిట్కా: భవిష్యత్ బ్యాచ్‌లకు, మీ కోకూన్‌లు స్పిన్నింగ్ దశలోకి ప్రవేశించిన తర్వాత బ్యాచ్ స్క్రీన్‌లో పంట రిమైండర్ హెచ్చరిక సెట్ చేయండి.`,

    ta: `கூட்டுப்புழு பகுப்பாய்வு முடிவு. கண்டறியப்பட்ட நிலை: காலம் தாழ்ந்தது — உடனே அறுவடை செய்யுங்கள். நம்பகத்தன்மை: {confidence} சதவீதம்.
நிலை நிலைமை: உகந்த நேரம் கடந்தது — கூட்டுப்புழு சிதைகிறது. அறுவடை சாளரம் மூடப்பட்டது. உள்ளே உலர்கிறது.
ஓட்டு நிலை: கருமையடைந்தது, சற்று காகிதம் போலுள்ளது. ஓட்டிலிருந்து ஈரப்பதம் போனது — மேற்பரப்பு மங்கலாக தெரிகிறது.
நூல் தாக்கம்: குறைந்தது — அதிகரித்த உடைவு ஆபத்து. நூல் நீளம் உச்ச அறுவடையை விட குறைவு.
மதிப்பிடப்பட்ட தாமதம்: சரியான சாளரத்தை தாண்டி 2 முதல் 4 நாட்கள். ஓட்டு நிற மாற்றம் மற்றும் அமைப்பு பகுப்பாய்வின் அடிப்படையில்.
அவசர நிலை: இன்றே அறுவடை செய்யுங்கள். மேலும் தாமதம் விற்பனை மதிப்பை கணிசமாக குறைக்கும்.
சாத்தியமான காரணம்: அறுவடை சாளரம் தவறவிட்டது. அடுத்த தொகுதியில் அறுவடை நினைவூட்டலை இயக்குவதை கருத்தில் கொள்ளுங்கள்.
ஆலோசனை: உடனே அறுவடை செய்யுங்கள். தொகுதி நிலையை அறுவடை செய்யப்பட்டதாக புதுப்பிக்கவும். செயலி நிலையின் அடிப்படையில் சரிசெய்யப்பட்ட சந்தை எதிர்பார்ப்புகளை காண்பிக்கும்.
வயல் குறிப்பு: எதிர்கால தொகுதிகளுக்கு, உங்கள் கூட்டுப்புழுக்கள் நூற்பு கட்டத்தில் நுழைந்தவுடன் தொகுதி திரையில் அறுவடை நினைவூட்டல் எச்சரிக்கை அமைக்கவும்.`,

    hi: `कोकून विश्लेषण परिणाम. पहचाना गया चरण: अतिदेय — तुरंत कटाई करें. विश्वास: {confidence} प्रतिशत.
चरण स्थिति: सर्वोत्तम समय बीत गया — प्यूपा बिगड़ रहा है. कटाई की खिड़की बंद हो गई. अंदर प्यूपा सूख रहा है.
खोल की स्थिति: काला पड़ गया, थोड़ा कागज जैसा. खोल से नमी चली गई — सतह फीकी दिखती है.
फिलामेंट प्रभाव: कम हुआ — टूटने का बढ़ा खतरा. धागे की लंबाई चरम कटाई से कम.
अनुमानित देरी: सर्वोत्तम खिड़की से 2 से 4 दिन आगे. खोल के रंग बदलाव और बनावट विश्लेषण के आधार पर.
तात्कालिकता स्तर: आज ही कटाई करें. और देरी से बिक्री मूल्य काफी कम हो जाएगा.
संभावित कारण: कटाई की खिड़की चूक गई. अगले बैच में कटाई अनुस्मारक सक्षम करने पर विचार करें.
सलाह: तुरंत कटाई करें. बैच की स्थिति को काटा हुआ अपडेट करें. ऐप स्थिति के आधार पर समायोजित बाजार अपेक्षाएं दिखाएगा.
खेत सुझाव: भविष्य के बैच के लिए, जब आपके कोकून कताई चरण में प्रवेश करें तो बैच स्क्रीन में कटाई अनुस्मारक अलर्ट सेट करें.`,
  },
};

// Replace {confidence} placeholder with actual value
const getScript = (result, lang) => {
  const className = result.className?.toLowerCase().trim();
  const langScripts = SCRIPTS[className];
  if (!langScripts) return "";
  const template = langScripts[lang] || langScripts.en;
  return template.replace("{confidence}", result.confidence);
};

export default function VoiceAssistant({ result }) {
  const {
    speak, stop, toggle,
    isPlaying, isPaused,
    supported,
    currentLang, setCurrentLang,
  } = useVoiceReader();

  const [showLangPicker, setShowLangPicker] = useState(false);

  const script = getScript(result, currentLang);

  useEffect(() => {
    return () => stop();
  }, [result]);

  if (!supported) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-400">
        Voice assistant not supported in this browser.
      </div>
    );
  }

  const currentVoiceLang = VOICE_LANGS.find((l) => l.code === currentLang);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🔊</span>
          <div>
            <div className="text-xs font-medium text-gray-700">Voice Assistant</div>
            <div className="text-xs text-gray-400">Reads out the full analysis</div>
          </div>
        </div>
        <button
          onClick={() => setShowLangPicker((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg"
        >
          <span className="notranslate">{currentVoiceLang?.label || "EN"}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`w-3 h-3 transition-transform ${showLangPicker ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Language picker */}
      {showLangPicker && (
        <div className="border-b border-gray-50 px-4 py-2 flex flex-wrap gap-2">
          {VOICE_LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code);
                setShowLangPicker(false);
                if (isPlaying || isPaused) {
                  stop();
                  setTimeout(() => speak(getScript(result, lang.code), lang.code), 150);
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors notranslate
                ${currentLang === lang.code
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-600 border-gray-200"}`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => toggle(script)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0
            ${isPlaying && !isPaused
              ? "bg-amber-100 text-amber-700"
              : "bg-green-700 text-white"}`}
        >
          {isPlaying && !isPaused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="text-xs font-medium text-gray-700">
            {isPlaying && !isPaused ? "Reading analysis..."
              : isPaused ? "Paused"
              : "Tap to read analysis aloud"}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 notranslate">
            {currentVoiceLang?.native} · {isPlaying ? "Playing" : "Ready"}
          </div>
        </div>

        {isPlaying && !isPaused && (
          <div className="flex items-end gap-0.5 h-5 flex-shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-1 bg-green-600 rounded-full"
                style={{
                  height: `${40 + i * 15}%`,
                  animation: `bounce${i} 0.6s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {(isPlaying || isPaused) && (
          <button onClick={stop}
            className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes bounce1 { from { height: 30% } to { height: 80% } }
        @keyframes bounce2 { from { height: 50% } to { height: 100% } }
        @keyframes bounce3 { from { height: 40% } to { height: 90% } }
        @keyframes bounce4 { from { height: 60% } to { height: 70% } }
      `}</style>
    </div>
  );
}
