
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useLanguage } from '@/context/LanguageContext';
import ramkund from '@/assets/ramkund.png';
import templeUploaded from '@/assets/ramkund-arti.png';
import templeGoogle from '@/assets/ramkund-dom.png';
import panchavati1 from '@/assets/nashik-panchavati-1.png';
import panchavati2 from '@/assets/nashik-panchavati-2.png';
import panchavati3 from '@/assets/nashik-panchavati-3.png';
import panchavati4 from '@/assets/trimbkeshwar.png';

const HeroSlider = () => {
  const { language } = useLanguage();

  const slides = [
    {
      id: 'slide-1',
      title: language === 'english' 
        ? 'Sacred Ramkund at Panchavati'
        : language === 'hindi' 
          ? 'पंचवटी में पवित्र रामकुंड'
          : 'पंचवटीतील पवित्र रामकुंड',
      description: language === 'english' 
        ? 'The holy bathing ghat where Lord Rama bathed'
        : language === 'hindi' 
          ? 'पवित्र स्नान घाट जहाँ भगवान राम ने स्नान किया था'
          : 'पवित्र स्नान घाट जेथे भगवान राम स्नान करत होते',
      image: ramkund
    },
    {
      id: 'slide-2',
      title: language === 'english' 
        ? 'Goda Aarti'
        : language === 'hindi' 
          ? 'नाशिक की गोदा आरती की दिव्य अनुभूति'
          : 'नाशिकच्या गोदाआर्तीची दिव्य अनुभूती',
      description: language === 'english' 
        ? 'Divine vibes of Nashik’s Goda Arti'
        : language === 'hindi' 
        ? 'नाशिक की गोदा आरती की दिव्य अनुभूति'
        : 'नाशिकच्या गोदाआर्तीची दिव्य अनुभूती',
      image: templeUploaded
    },
    {
      id: 'slide-3',
title: language === 'english' 
  ? 'Divine Essence of Nashik'
  : language === 'hindi' 
    ? 'नाशिक की दिव्य आभा'
    : 'नाशिकची दिव्य आभा',
description: language === 'english' 
  ? 'Where faith flows with the holy Godavari'
  : language === 'hindi' 
    ? 'जहाँ श्रद्धा पवित्र गोदावरी के संग बहती है'
    : 'जिथे श्रद्धा पवित्र गोदावरीसोबत प्रवाहित होते',
      image: templeGoogle
    },
    {
      id: 'slide-4',
      title: language === 'english' 
        ? 'Welcome to Kumbh Mela'
        : language === 'hindi' 
          ? 'कुंभ मेले में आपका स्वागत है'
          : 'कुंभ मेळ्यात आपले स्वागत आहे',
      description: language === 'english' 
        ? 'The largest peaceful gathering of people in the world'
        : language === 'hindi' 
          ? 'दुनिया का सबसे बड़ा शांतिपूर्ण लोगों का जमावड़ा'
          : 'जगातील सर्वात मोठे शांतताप्रिय लोकांचे मेळावा',
      image: panchavati1
    },
    {
      id: 'slide-5',
      title: language === 'english'
        ? 'Sacred Temples'
        : language === 'hindi'
          ? 'पवित्र मंदिर'
          : 'पवित्र मंदिरे',
      description: language === 'english'
        ? 'Explore the ancient temples and spiritual sites'
        : language === 'hindi'
          ? 'प्राचीन मंदिरों और आध्यात्मिक स्थलों का अन्वेषण करें'
          : 'प्राचीन मंदिरे आणि आध्यात्मिक स्थळे अन्वेषण करा',
      image: panchavati2
    },
    {
      id: 'slide-6',
      title: language === 'english'
        ? 'Holy Rivers'
        : language === 'hindi'
          ? 'पवित्र नदियां'
          : 'पवित्र नद्या',
      description: language === 'english'
        ? 'The sacred confluence of rivers at Triveni Sangam'
        : language === 'hindi'
          ? 'त्रिवेणी संगम पर नदियों का पवित्र संगम'
          : 'त्रिवेणी संगमावर नद्यांचा पवित्र संगम',
      image: panchavati3
    },
    {
      id: 'slide-7',
      title: language === 'english'
        ? 'Spiritual Gatherings'
        : language === 'hindi'
          ? 'आध्यात्मिक सभाएं'
          : 'आध्यात्मिक मेळावे',
      description: language === 'english'
        ? 'Join millions in celebration of faith and culture'
        : language === 'hindi'
          ? 'आस्था और संस्कृति के उत्सव में लाखों लोगों के साथ शामिल हों'
          : 'श्रद्धा आणि संस्कृतीच्या उत्सवात लाखो लोकांसोबत सहभागी व्हा',
      image: panchavati4
    }
  ];

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <Card className="border-0 overflow-hidden">
              <CardContent className="relative p-0 aspect-[16/9] md:aspect-[21/9]">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
                  <p className="text-white/90 mt-1">{slide.description}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
};

export default HeroSlider;
