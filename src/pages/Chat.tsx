import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  User,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Fake training dataset for Arti/Aarti schedules
// Times are illustrative; adjust as needed.
const AARTI_DATA: Record<string, Record<string, { name: string; times: { morning?: string; noon?: string; evening?: string; night?: string } }>> = {
  // Keyed by weekday (lowercase)
  sunday: {
    main: { name: "Main Temple", times: { morning: "05:30 AM", noon: "12:00 PM", evening: "06:30 PM", night: "08:30 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:00 AM", evening: "07:00 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
  monday: {
    main: { name: "Main Temple", times: { morning: "05:30 AM", noon: "12:00 PM", evening: "06:30 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:10 AM", evening: "07:10 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
  tuesday: {
    main: { name: "Main Temple", times: { morning: "05:30 AM", noon: "12:15 PM", evening: "06:30 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:10 AM", evening: "07:15 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
  wednesday: {
    main: { name: "Main Temple", times: { morning: "05:40 AM", noon: "12:00 PM", evening: "06:35 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:15 AM", evening: "07:10 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
  thursday: {
    main: { name: "Main Temple", times: { morning: "05:35 AM", noon: "12:05 PM", evening: "06:35 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:10 AM", evening: "07:05 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
  friday: {
    main: { name: "Main Temple", times: { morning: "05:30 AM", noon: "12:00 PM", evening: "06:40 PM", night: "08:30 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:00 AM", evening: "07:15 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
  saturday: {
    main: { name: "Main Temple", times: { morning: "05:30 AM", noon: "12:10 PM", evening: "06:40 PM" } },
    hanuman: { name: "Hanuman Temple", times: { morning: "06:05 AM", evening: "07:10 PM" } },
    ghat: { name: "Ganga Aarti (Ghat)", times: { evening: "07:00 PM" } },
  },
};

function normalizePlace(input: string): keyof (typeof AARTI_DATA)["sunday"] {
  const q = input.toLowerCase();
  if (q.includes("hanuman")) return "hanuman";
  if (q.includes("ghat") || q.includes("ganga")) return "ghat";
  return "main";
}

function formatAartiTimes(dayKey: keyof typeof AARTI_DATA, placeKey: keyof (typeof AARTI_DATA)["sunday"]) {
  const entry = AARTI_DATA[dayKey]?.[placeKey];
  if (!entry) return "No aarti timings found.";
  const t = entry.times;
  const parts: string[] = [];
  if (t.morning) parts.push(`Morning: ${t.morning}`);
  if (t.noon) parts.push(`Noon: ${t.noon}`);
  if (t.evening) parts.push(`Evening: ${t.evening}`);
  if (t.night) parts.push(`Night: ${t.night}`);
  return `${entry.name} — ${parts.join(" | ")}`;
}

function getDayKey(date = new Date()): keyof typeof AARTI_DATA {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][date.getDay()] as keyof typeof AARTI_DATA;
}

const Chat: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === "hindi") return hindi;
    if (language === "marathi") return marathi;
    return eng;
  };

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: getLocalizedText(
        "👋 Hello! I’m PilgrimAssist. How can I help you today?",
        "👋 नमस्ते! मैं पिलग्रिमअसिस्ट हूँ। मैं आपकी कैसे मदद कर सकता/सकती हूँ?",
        "👋 नमस्कार! मी पिलग्रिमअसिस्ट आहे. मी तुम्हाला कशी मदत करू?"
      ),
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<"ai" | "authority">("ai");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS: { label: string; text: string }[] = [
    { label: getLocalizedText("Today's aarti schedule", "आज की आरती समय", "आजची आरती वेळ"), text: getLocalizedText("What's today's aarti schedule?", "आज की आरती समय क्या है?", "आजची आरती वेळ काय?") },
    { label: getLocalizedText("Crowd status now", "अभी भीड़ की स्थिति", "आत्ताची गर्दी स्थिती"), text: getLocalizedText("What's the crowd status now?", "अभी भीड़ कैसी है?", "आत्ता गर्दी कशी आहे?") },
    { label: getLocalizedText("Best route to temple", "मंदिर तक सुरक्षित मार्ग", "मंदिरापर्यंत सुरक्षित मार्ग"), text: getLocalizedText("Guide me to the main temple", "मुझे मुख्य मंदिर तक मार्गदर्शन करें", "मुख्य मंदिरापर्यंत मार्गदर्शन करा") },
    { label: getLocalizedText("Food/Langar nearby", "पास में भोजन/लंगर", "जवळपास भोजन/लंगर"), text: getLocalizedText("Where can I find food nearby?", "पास में भोजन कहाँ मिलेगा?", "जवळपास भोजन कुठे मिळेल?") },
    { label: getLocalizedText("Stay options near temple", "मंदिर के पास रहने की जगह", "मंदिराजवळ राहण्याची व्यवस्था"), text: getLocalizedText("Where can I stay near the temple?", "मंदिर के पास कहाँ ठहरूँ?", "मंदिराजवळ कुठे थांबू?") },
    { label: getLocalizedText("Lost & Found help", "खोया/लापता सहायता", "हरवले/सापडले मदत"), text: getLocalizedText("I lost my phone.", "मेरा फोन खो गया है।", "माझा फोन हरवला आहे.") },
    { label: getLocalizedText("Emergency contacts", "आपातकालीन संपर्क", "आपत्कालीन संपर्क"), text: getLocalizedText("Emergency contacts", "आपातकालीन संपर्क", "आपत्कालीन संपर्क") },
    { label: getLocalizedText("Chat with authority", "प्राधिकरण से चैट करें", "प्राधिकरणाशी चॅट करा"), text: getLocalizedText("Connect me to authority", "मुझे प्राधिकरण से जोड़ें", "मला प्राधिकरणाशी जोडा") },
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = { sender: "user", text: newMessage, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";

      if (chatMode === "ai") {
        const q = newMessage.toLowerCase();
        if (
          q.includes("lost") || q.includes("missing") ||
          q.includes("खोया") || q.includes("लापता") || q.includes("खो गयी") || q.includes("खो गया") ||
          q.includes("हरवले") || q.includes("हरवलं") || q.includes("हरवला")
        ) {
          reply = getLocalizedText(
            "If someone is missing, please visit the nearest help center or tap 'Chat with Authority' to report it immediately.",
            "यदि कोई लापता है, तो कृपया निकटतम सहायता केंद्र जाएं या 'प्राधिकरण से चैट करें' पर टैप करें।",
            "कोणी हरवले असल्यास, कृपया जवळच्या मदत केंद्रात जा किंवा 'प्राधिकरणाशी चॅट करा' वर टॅप करा."
          );
        } else if (
          q.includes("aarti") || q.includes("arti") || q.includes("arati") || q.includes("schedule") ||
          q.includes("आरती") || q.includes("आरतीचे") || q.includes("आरती का") || q.includes("आरती समय") ||
          q.includes("आरती टाइम") || q.includes("aarti timing")
        ) {
          const dayKey = getDayKey();
          const placeKey = normalizePlace(q);
          const timings = formatAartiTimes(dayKey, placeKey);
          reply = getLocalizedText(
            `Today's ${AARTI_DATA[dayKey][placeKey].name} aarti timings: ${timings}.`,
            `आज के ${AARTI_DATA[dayKey][placeKey].name} की आरती समय: ${timings}.`,
            `आजच्या ${AARTI_DATA[dayKey][placeKey].name} आरती वेळा: ${timings}.`
          );
        } else if (
          q.includes("crowd") || q.includes("bheed") || q.includes("भीड़") || q.includes("गर्दी")
        ) {
          reply = getLocalizedText(
            "Current crowd status: Moderate. Please keep to the left, stay hydrated, and avoid bottlenecks.",
            "वर्तमान भीड़ स्थिति: मध्यम। कृपया बाईं ओर चलें, पानी पीते रहें और भीड़ वाले स्थानों से बचें।",
            "सध्याची गर्दी: मध्यम. कृपया डावीकडून चालत रहा, पाणी प्या आणि अरुंद मार्ग टाळा."
          );
        } else if (
          q.includes("route") || q.includes("way") || q.includes("guide") ||
          q.includes("मार्ग") || q.includes("रास्ता") || q.includes("रस्ता") || q.includes("दिशा")
        ) {
          reply = getLocalizedText(
            "Safest route: Bus Stand → East Gate → Main Temple. Use Gate-2 if elderly are with you.",
            "सुरक्षित मार्ग: बस स्टैंड → ईस्ट गेट → मुख्य मंदिर। बुजुर्ग साथ हों तो गेट-2 का उपयोग करें।",
            "सुरक्षित मार्ग: बसस्थानक → ईस्ट गेट → मुख्य मंदिर. ज्येष्ठांसोबत असल्यास गेट-2 वापरा."
          );
        } else if (
          q.includes("food") || q.includes("langar") || q.includes("भोजन") || q.includes("खाना") || q.includes("जेवण")
        ) {
          reply = getLocalizedText(
            "Nearby food: Community Langar (Hall-3), Food Court A (veg), Riverfront Stalls.",
            "नज़दीकी भोजन: सामुदायिक लंगर (हॉल-3), फूड कोर्ट A (शाकाहारी), रिवरफ्रंट स्टॉल्स।",
            "जवळचे भोजन: सामुदायिक लंगर (हॉल-3), फूड कोर्ट A (शाकाहारी), रिव्हरफ्रंट स्टॉल्स."
          );
        } else if (
          q.includes("stay") || q.includes("accommodation") || q.includes("आवास") || q.includes("निवास") || q.includes("राहण्याची")
        ) {
          reply = getLocalizedText(
            "Stay options: Pilgrim Camp C (budget), Temple Rest House (family), River View Lodge.",
            "रहने के विकल्प: पिलग्रिम कैंप C (बजट), टेम्पल रेस्ट हाउस (परिवार), रिवर व्यू लॉज।",
            "निवास: पिलग्रिम कॅम्प C (बजेट), टेंपल रेस्ट हाउस (कुटुंब), रिव्हर व्ह्यू लॉज."
          );
        } else if (
          q.includes("emergency") || q.includes("help") || q.includes("आपातकाल") || q.includes("आपतकालीन") || q.includes("आपत्कालीन")
        ) {
          reply = getLocalizedText(
            "Emergency: First Aid Center (Hall-1), Police 100, Fire 101. Share your location if needed.",
            "आपातकाल: फर्स्ट एड सेंटर (हॉल-1), पुलिस 100, फायर 101. आवश्यकता हो तो अपना लोकेशन साझा करें।",
            "आपत्कालीन: फर्स्ट एड सेंटर (हॉल-1), पोलीस 100, फायर 101. गरज असल्यास लोकेशन शेअर करा."
          );
        } else if (q.includes("temple") || q.includes("mandir") || q.includes("मंदिर")) {
          reply = getLocalizedText(
            "You can find temple info in the 'Temple Guide' section.",
            "आप मंदिर की जानकारी 'टेम्पल गाइड' सेक्शन में पा सकते हैं।",
            "'टेम्पल गाइड' विभागात तुम्हाला मंदिरांची माहिती मिळेल."
          );
        } else {
          reply = getLocalizedText(
            "I'm here to assist you with routes, temples, and emergencies.",
            "मैं मार्ग, मंदिर और आपात स्थितियों में आपकी सहायता के लिए यहां हूं।",
            "मी मार्ग, मंदिर आणि आपत्कालीन परिस्थितींमध्ये मदत करण्यासाठी येथे आहे."
          );
        }
      } else {
        reply = getLocalizedText(
          "👮 Authority: We’ve received your message. Please share the missing person’s name and last seen location.",
          "👮 प्राधिकरण: हमें आपका संदेश प्राप्त हुआ है। कृपया लापता व्यक्ति का नाम और अंतिम देखी गई जगह बताएं।",
          "👮 प्राधिकरण: आम्हाला तुमचा संदेश प्राप्त झाला आहे. कृपया हरवलेल्या व्यक्तीचे नाव आणि शेवटचे ठिकाण सांगा."
        );
      }

      setMessages((prev) => [
        ...prev,
        { sender: chatMode === "authority" ? "authority" : "bot", text: reply, timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const sendQuick = (text: string) => {
    setNewMessage(text);
    // Send on next tick so state updates first
    setTimeout(() => handleSend(), 0);
  };

  const handleClear = () => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Chat has been reset. How can I help you now?",
        timestamp: new Date(),
      },
    ]);
    toast({ description: "Chat cleared successfully!" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const pageTitle = getLocalizedText(
    "Chat with PilgrimAssist",
    "पिलग्रिमअसिस्ट से चैट करें",
    "पिलग्रिमअसिस्ट शी चॅट करा"
  );

  return (
    <DashboardLayout title={pageTitle}>
      <Card className="relative w-full max-w-6xl mx-auto h-[calc(100vh-4rem)] border-0 rounded-3xl overflow-hidden shadow-[0_10px_60px_-15px_rgba(255,165,0,0.3)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url('/images/temple-bg.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-orange-50/80 to-yellow-50/70 backdrop-blur-[6px]"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header with Mode Buttons */}
          <CardHeader className="flex flex-col border-b border-orange-100 bg-gradient-to-r from-orange-100/70 to-yellow-50/60 py-5 px-6 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-orange-700">
                  {pageTitle}
                </CardTitle>
                <CardDescription className="text-gray-700">
                  {chatMode === "ai"
                    ? getLocalizedText(
                        "You are chatting with the AI Assistant.",
                        "आप एआई सहायक से बात कर रहे हैं।",
                        "तुम्ही एआय सहाय्यकाशी बोलत आहात."
                      )
                    : getLocalizedText(
                        "You are now connected to an on-duty authority representative.",
                        "आप अब एक ड्यूटी पर मौजूद अधिकारी से जुड़े हैं।",
                        "तुम्ही आता ड्युटीवरील अधिकाऱ्याशी जोडले गेले आहात."
                      )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chatMode === "ai" ? "default" : "outline"}
                  onClick={() => setChatMode("ai")}
                >
                  🤖 {getLocalizedText("AI Assistant", "एआई सहायक", "एआय सहाय्यक")}
                </Button>
                {/* Authority button removed as requested */}
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  {getLocalizedText("Clear", "साफ़ करें", "क्लियर करा")}
                </Button>
              </div>
            </div>
          </CardHeader>

                  {/* Suggested Questions - Modern Style */}
        <div className="px-6 py-4 border-b border-orange-100 bg-white/80 backdrop-blur-md">
          <div className="text-center mb-3">
            <p className="text-gray-600 text-sm">
              {getLocalizedText(
                'Choose a quick question below 👇',
                'नीचे एक त्वरित प्रश्न चुनें 👇',
                'खाली एक जलद प्रश्न निवडा 👇'
              )}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTIONS.map((q) => (
              <button
                key={q.label}
                onClick={() => sendQuick(q.text)}
                className="px-5 py-2 rounded-full bg-white text-orange-600 border border-orange-300 font-medium text-sm shadow-sm hover:bg-orange-50 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-orange-300"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>


          {/* Chat Messages */}
          <CardContent className="flex flex-col h-[calc(100%-10.5rem)] px-6 py-4 overflow-y-auto">
            <div className="flex-grow space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  {msg.sender !== "user" && (
                    <Avatar className="h-9 w-9 mr-2 shadow-md">
                      <AvatarImage
                        src={
                          msg.sender === "authority"
                            ? "/authority-icon.png"
                            : "/bot-icon.png"
                        }
                        alt={msg.sender}
                      />
                      <AvatarFallback className="bg-orange-400 text-white">
                        {msg.sender === "authority" ? "A" : "PA"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[75%] shadow-md ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-tr-none"
                        : msg.sender === "authority"
                        ? "bg-orange-100 text-gray-800 rounded-tl-none"
                        : "bg-white/90 border border-orange-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start text-gray-500 text-sm italic">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {getLocalizedText("Typing...", "लिख रहा है...", "टाइप करत आहे...")}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Field */}
            <div className="border-t border-orange-200 pt-3 bg-white/80 backdrop-blur-md rounded-t-2xl mt-4 flex items-end space-x-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getLocalizedText(
                  "Type your message...",
                  "अपना संदेश टाइप करें...",
                  "तुमचा संदेश टाइप करा..."
                )}
                className="flex-grow resize-none rounded-2xl border border-orange-200 bg-white/70 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-700"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={isTyping}
                className="rounded-full p-4 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                {isTyping ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Chat;
