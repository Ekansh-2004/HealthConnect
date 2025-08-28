import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.learn": "Learn",
      "nav.chat": "Ask Questions",
      "nav.stories": "Stories",
      "nav.consultations": "Consultations",
      "nav.profile": "Profile",
      "nav.admin": "Admin",
      "nav.logout": "Logout",

      // Common
      "common.loading": "Loading...",
      "common.submit": "Submit",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.edit": "Edit",
      "common.delete": "Delete",

      // Auth
      "auth.login": "Login",
      "auth.signup": "Sign Up",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.role": "I am a...",
      "auth.adolescent": "Adolescent (13-19 years)",
      "auth.adult": "Adult (20+ years)",
      "auth.healthcare": "Healthcare Professional",

      // Dashboard
      "dashboard.welcome": "Welcome back",
      "dashboard.recent_activity": "Recent Activity",
      "dashboard.quick_actions": "Quick Actions",

      // Content
      "content.myths_facts": "Myths vs Facts",
      "content.quiz": "Take Quiz",
      "content.read_aloud": "Read Aloud",
      "content.share_story": "Share Your Story",

      // Chat
      "chat.title": "Health Assistant",
      "chat.placeholder": "Ask your question anonymously...",
      "chat.connect_doctor": "Connect to Doctor",

      // Stories
      "stories.title": "Community Stories",
      "stories.submit": "Share Your Story",
      "stories.anonymous": "Your story will be shared anonymously",
      "stories.pending": "Story submitted for review",

      // Consultations
    "consultations.title": "Book Consultation",
      "consultations.subtitle": "Book confidential consultations with healthcare professionals",
      "consultations.book": "Book Consultation",
      "consultations.upcoming": "Upcoming Appointments",
      "consultations.past": "Past Appointments", // ✅ Added
      "consultations.join": "Join Video Call",
      "consultations.success": "Appointment Added",
      "consultations.loadingDoctors": "Loading doctors...",
      "consultations.noDoctors": "No doctors available",
      "consultations.selectDoctor": "Select Doctor",
      "consultations.selectDate": "Select Date",
      "consultations.selectTime": "Select Time",
      "consultations.doctor": "Doctor",
      "consultations.date": "Date",
      "consultations.time": "Time",
      "consultations.type": "Consultation Type",
      "consultations.reason": "Reason for Visit (Optional)",
    },
  },
  hi: {
    translation: {
      // Navigation
      "nav.home": "होम",
      "nav.learn": "सीखें",
      "nav.chat": "प्रश्न पूछें",
      "nav.stories": "कहानियां",
      "nav.consultations": "परामर्श",
      "nav.profile": "प्रोफाइल",
      "nav.admin": "व्यवस्थापक",
      "nav.logout": "लॉगआउट",

      // Common
      "common.loading": "लोड हो रहा है...",
      "common.submit": "जमा करें",
      "common.cancel": "रद्द करें",
      "common.save": "सेव करें",
      "common.edit": "संपादित करें",
      "common.delete": "डिलीट करें",

      // Auth
      "auth.login": "लॉगिन",
      "auth.signup": "साइन अप",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",
      "auth.role": "मैं हूँ...",
      "auth.adolescent": "किशोर (13-19 वर्ष)",
      "auth.adult": "वयस्क (20+ वर्ष)",
      "auth.healthcare": "स्वास्थ्य पेशेवर",

      // Dashboard
      "dashboard.welcome": "वापस स्वागत है",
      "dashboard.recent_activity": "हाल की गतिविधि",
      "dashboard.quick_actions": "त्वरित कार्य",

      // Content
      "content.myths_facts": "मिथक बनाम तथ्य",
      "content.quiz": "प्रश्नोत्तरी लें",
      "content.read_aloud": "पढ़कर सुनाएं",
      "content.share_story": "अपनी कहानी साझा करें",

      // Chat
      "chat.title": "स्वास्थ्य सहायक",
      "chat.placeholder": "अपना प्रश्न गुमनाम रूप से पूछें...",
      "chat.connect_doctor": "डॉक्टर से जुड़ें",

      // Stories
      "stories.title": "सामुदायिक कहानियां",
      "stories.submit": "अपनी कहानी साझा करें",
      "stories.anonymous": "आपकी कहानी गुमनाम रूप से साझा की जाएगी",
      "stories.pending": "कहानी समीक्षा के लिए प्रस्तुत की गई",

      // Consultations
      "consultations.title": "परामर्श बुक करें",
      "consultations.subtitle": "स्वास्थ्य पेशेवरों के साथ गोपनीय परामर्श बुक करें",
      "consultations.book": "परामर्श बुक करें",
      "consultations.upcoming": "आगामी अपॉइंटमेंट्स",
      "consultations.past": "पिछली अपॉइंटमेंट्स", // ✅ Added
      "consultations.join": "वीडियो कॉल में शामिल हों",
      "consultations.success": "अपॉइंटमेंट जोड़ा गया",
      "consultations.loadingDoctors": "डॉक्टर लोड हो रहे हैं...",
      "consultations.noDoctors": "कोई डॉक्टर उपलब्ध नहीं है",
      "consultations.selectDoctor": "डॉक्टर चुनें",
      "consultations.selectDate": "तारीख चुनें",
      "consultations.selectTime": "समय चुनें",
      "consultations.doctor": "डॉक्टर",
      "consultations.date": "तारीख",
      "consultations.time": "समय",
      "consultations.type": "परामर्श प्रकार",
      "consultations.reason": "भेंट का कारण (वैकल्पिक)",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
