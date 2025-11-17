
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Phone, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, LostPersonReport } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthorityChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: LostPersonReport;
}

const AuthorityChatDialog: React.FC<AuthorityChatDialogProps> = ({
  isOpen,
  onClose,
  report
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  useEffect(() => {
    if (user) {
      setIsAuthority(user.id === report.authorityId);
    }
  }, [user, report.authorityId]);

  useEffect(() => {
    if (isOpen && report.id) {
      loadMessages();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`chat-${report.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'report_chat_messages',
            filter: `report_id=eq.${report.id}`
          },
          (payload) => {
            console.log('New message received:', payload);
            // Add the new message to the state
            const newChatMessage: ChatMessage = {
              id: payload.new.id,
              reportId: payload.new.report_id,
              senderId: payload.new.sender_id,
              message: payload.new.message,
              createdAt: new Date(payload.new.created_at),
              readAt: payload.new.read_at ? new Date(payload.new.read_at) : undefined
            };
            setMessages(prev => [...prev, newChatMessage]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'report_chat_messages',
            filter: `report_id=eq.${report.id}`
          },
          (payload) => {
            console.log('Message updated:', payload);
            // Update the message in state (for read receipts, etc.)
            setMessages(prev => prev.map(msg => 
              msg.id === payload.new.id 
                ? {
                    ...msg,
                    readAt: payload.new.read_at ? new Date(payload.new.read_at) : undefined
                  }
                : msg
            ));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, report.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('report_chat_messages')
        .select('*')
        .eq('report_id', report.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages = data?.map(msg => ({
        id: msg.id,
        reportId: msg.report_id,
        senderId: msg.sender_id,
        message: msg.message,
        createdAt: new Date(msg.created_at),
        readAt: msg.read_at ? new Date(msg.read_at) : undefined
      })) || [];

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: getLocalizedText(
          "Error loading messages",
          "संदेश लोड करने में त्रुटि",
          "संदेश लोड करताना त्रुटी"
        ),
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('report_chat_messages')
        .insert({
          report_id: report.id,
          sender_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      // No need to manually reload messages - real-time subscription will handle it
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: getLocalizedText(
          "Error sending message",
          "संदेश भेजने में त्रुटि",
          "संदेश पाठवताना त्रुटी"
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getContactInfo = () => {
    if (isAuthority) {
      return {
        name: report.reporterName || getLocalizedText("Reporter", "रिपोर्टर", "रिपोर्टर"),
        phone: report.reporterPhone,
        label: getLocalizedText("🙍‍♂️ Reporter Details:", "🙍‍♂️ रिपोर्टर विवरण:", "🙍‍♂️ रिपोर्टर तपशील:")
      };
    } else {
      return {
        name: report.authorityName || getLocalizedText("Authority", "अधिकारी", "अधिकारी"),
        phone: report.authorityPhone,
        label: getLocalizedText("👮 Authority Details:", "👮 अधिकारी विवरण:", "👮 अधिकारी तपशील:")
      };
    }
  };

  const contactInfo = getContactInfo();

  // Access control: Only allow chat if user is either the reporter or the assigned authority
  const hasAccess = user?.id === report.reporterId || user?.id === report.authorityId;

  if (!hasAccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getLocalizedText("Access Denied", "पहुंच अस्वीकृत", "प्रवेश नाकारला")}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">
              {getLocalizedText(
                "You don't have permission to access this chat.",
                "आपको इस चैट तक पहुंचने की अनुमति नहीं है।",
                "तुम्हाला या चॅटमध्ये प्रवेश करण्याची परवानगी नाही."
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isAuthority ? (
              <>
                <User className="h-5 w-5 text-blue-600" />
                <span>{getLocalizedText(
                  "Chat with Reporter",
                  "रिपोर्टर से चैट करें",
                  "रिपोर्टरशी चॅट करा"
                )}</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-gray-600" />
                <span>{getLocalizedText(
                  "Chat with Authority",
                  "अधिकारी से चैट करें",
                  "अधिकाऱ्याशी चॅट करा"
                )}</span>
              </>
            )}
          </DialogTitle>
          {contactInfo.name && (
            <div className="bg-gray-50 p-3 rounded-lg mt-2">
              <p className="text-sm font-medium text-gray-700">
                {contactInfo.label} <strong>{contactInfo.name}</strong>
              </p>
              {contactInfo.phone && (
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  <strong>{getLocalizedText("Phone:", "फोन:", "फोन:")}</strong> {contactInfo.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2 italic">
                {isAuthority ? 
                  getLocalizedText(
                    "Contact the reporter for coordination regarding the found person.",
                    "पाए गए व्यक्ति के संबंध में समन्वय के लिए रिपोर्टर से संपर्क करें।",
                    "सापडलेल्या व्यक्तीबद्दल समन्वयासाठी रिपोर्टरशी संपर्क साधा."
                  ) :
                  getLocalizedText(
                    "Contact the authority for coordination regarding your found person.",
                    "अपने पाए गए व्यक्ति के संबंध में समन्वय के लिए अधिकारी से संपर्क करें।",
                    "तुमच्या सापडलेल्या व्यक्तीबद्दल समन्वयासाठी अधिकाऱ्याशी संपर्क साधा."
                  )
                }
              </p>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">
                  {getLocalizedText(
                    "No messages yet. Start a conversation!",
                    "अभी तक कोई संदेश नहीं। बातचीत शुरू करें!",
                    "अजून कोणते संदेश नाहीत. संभाषण सुरू करा!"
                  )}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.senderId === user?.id;
                const senderName = isCurrentUser ? 
                  getLocalizedText("You", "आप", "तुम्ही") :
                  (isAuthority ? 
                    (report.reporterName || getLocalizedText("Reporter", "रिपोर्टर", "रिपोर्टर")) :
                    (report.authorityName || getLocalizedText("Authority", "अधिकारी", "अधिकारी"))
                  );

                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div className={`max-w-[75%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                      {/* Sender identity marker */}
                      <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {isCurrentUser ? (
                          <div className="flex items-center text-xs text-blue-600 font-medium">
                            <User className="h-3 w-3 mr-1" />
                            <span>{getLocalizedText("You", "आप", "तुम्ही")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-gray-600 font-medium">
                            <Shield className="h-3 w-3 mr-1" />
                            <span>{isAuthority ? getLocalizedText("Reporter", "रिपोर्टर", "रिपोर्टर") : getLocalizedText("Authority", "अधिकारी", "अधिकारी")}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Message bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isCurrentUser
                            ? 'bg-pilgrim-orange text-white rounded-tr-md'
                            : 'bg-blue-100 text-gray-800 rounded-tl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        
                        {/* Timestamp */}
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-white/80 text-right' : 'text-gray-500 text-left'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4 bg-gray-50">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getLocalizedText(
                "Type your message here...",
                "अपना संदेश यहाँ टाइप करें...",
                "तुमचा संदेश इथे टाइप करा..."
              )}
              disabled={loading}
              className="flex-1 border-gray-300 focus:border-pilgrim-orange focus:ring-pilgrim-orange"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              className="bg-pilgrim-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorityChatDialog;
