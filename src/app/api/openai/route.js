import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('Received query:', message);

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('⚠️ OpenAI API key not found, using fallback responses');
      return NextResponse.json({ 
        message: getFallbackResponse(message),
        source: 'fallback_no_key' 
      });
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      console.log('⚠️ Invalid OpenAI API key format, using fallback responses');
      return NextResponse.json({ 
        message: getFallbackResponse(message),
        source: 'fallback_invalid_key' 
      });
    }

    // Try to use OpenAI with enhanced error handling
    try {
      console.log('🤖 Attempting to use OpenAI API with gpt-4o-mini...');
      const { default: OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: apiKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          {
            role: "system",
            content: `You are an expert travel assistant specializing in Cameroon. Provide accurate, helpful, and engaging information about:

🏙️ Cities: Douala, Yaoundé, Bamenda, Buea, and other Cameroonian cities
🌤️ Weather and climate patterns across different regions
🏛️ Tourist attractions, landmarks, and cultural sites
🎭 Local culture, traditions, and customs
🚌 Transportation options including buses, taxis, and travel routes
🛡️ Safety tips and travel security advice
🍽️ Local cuisine and food recommendations
💰 Currency, costs, and budget planning
📋 Visa requirements and entry procedures
🏨 Accommodation options
🗣️ Language tips and communication

Keep responses informative but concise (max 300 words). Use emojis to make responses engaging. Always prioritize practical, actionable travel advice. If you don't have specific information, provide general travel guidance for Cameroon.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
      
      console.log('✅ OpenAI API call successful with gpt-4o-mini');
      return NextResponse.json({ 
        message: aiResponse,
        source: 'openai_gpt4o_mini',
        model: 'gpt-4o-mini'
      });
      
    } catch (openaiError) {
      console.error('❌ OpenAI API error:', openaiError.message);
      
      // Enhanced rate limiting detection
      if (openaiError.status === 429 || openaiError.message.includes('too many requests') || openaiError.message.includes('rate limit')) {
        console.error('⏱️ OpenAI API rate limit exceeded - too many requests');
        return NextResponse.json({ 
          message: `⏱️ **AI Service Busy**

The AI travel assistant is currently experiencing high demand and has reached its usage limit. 

Please try again in a few minutes, or use our offline travel information below:

${getFallbackResponse(message)}

💡 **Tip**: The AI service typically resets every minute, so please try again shortly!`,
          source: 'fallback_rate_limit_enhanced',
          retryAfter: 60 // seconds
        });
      }
      
      // Check for authentication errors
      if (openaiError.status === 401) {
        console.error('❌ OpenAI API key is invalid or expired');
        return NextResponse.json({ 
          message: `🔑 **Authentication Issue**

There's an issue with the AI service authentication. Using our travel database instead:

${getFallbackResponse(message)}`,
          source: 'fallback_auth_error'
        });
      }
      
      // Check for quota exceeded
      if (openaiError.status === 403 || openaiError.message.includes('quota')) {
        console.error('💳 OpenAI quota exceeded');
        return NextResponse.json({ 
          message: `💳 **AI Service Quota Exceeded**

The AI service has reached its usage quota for this period. Here's information from our travel database:

${getFallbackResponse(message)}

🔄 Service will be restored in the next billing cycle.`,
          source: 'fallback_quota_exceeded'
        });
      }
      
      // Model not found - try fallback model
      if (openaiError.code === 'model_not_found' || openaiError.status === 404) {
        console.log('🔄 Model gpt-4o-mini not available, trying gpt-3.5-turbo...');
        try {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({ apiKey: apiKey });
          
          const fallbackCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a helpful travel assistant for Cameroon. Provide accurate travel information about cities like Douala, Yaoundé, Bamenda, and Buea. Include practical advice about weather, attractions, culture, transportation, and safety. Keep responses concise and use emojis.`
              },
              {
                role: "user",
                content: message
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          });
          
          const fallbackResponse = fallbackCompletion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
          console.log('✅ GPT-3.5-turbo fallback successful');
          return NextResponse.json({ 
            message: fallbackResponse + '\n\n📱 *Powered by GPT-3.5-turbo*',
            source: 'openai_gpt35_fallback',
            model: 'gpt-3.5-turbo'
          });
        } catch (fallbackError) {
          console.error('❌ Fallback model also failed:', fallbackError.message);
          
          // If fallback also hits rate limit
          if (fallbackError.status === 429) {
            return NextResponse.json({ 
              message: `⏱️ **All AI Services Busy**

Both primary and backup AI services are currently experiencing high demand.

Here's comprehensive travel information from our database:

${getFallbackResponse(message)}

🔄 **Please try again in 2-3 minutes for AI-powered responses.**`,
              source: 'fallback_all_rate_limited',
              retryAfter: 180
            });
          }
        }
      }
      
      // Server errors
      if (openaiError.status >= 500) {
        console.error('🚫 OpenAI server error');
        return NextResponse.json({ 
          message: `🚫 **AI Service Temporarily Down**

The AI service is experiencing technical difficulties. Here's information from our travel database:

${getFallbackResponse(message)}

🔧 Please try again in a few minutes.`,
          source: 'fallback_server_error'
        });
      }
      
      // For any other errors, provide fallback
      console.log('🔄 Using fallback response due to OpenAI error');
      return NextResponse.json({ 
        message: `🔄 **Using Offline Information**

AI service temporarily unavailable. Here's information from our comprehensive travel database:

${getFallbackResponse(message)}

💡 Try asking the AI again in a moment for more detailed responses!`,
        source: 'fallback_other_error'
      });
    }

  } catch (error) {
    console.error('💥 API route error:', error);
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable',
        message: `❌ **Service Temporarily Unavailable**

Our travel information service is currently experiencing issues. Please try again in a moment.

If the problem persists, you can still browse schedules, book tickets, and use other features of the app.`,
        source: 'fallback_general_error'
      },
      { status: 500 }
    );
  }
}

// Enhanced fallback responses when OpenAI is not available
function getFallbackResponse(message) {
  const query = message.toLowerCase();
  
  const travelInfo = {
    'douala': {
      weather: 'Tropical climate, average 26°C. Rainy season: March-November',
      attractions: ['Douala Maritime Museum', 'La Pagode', 'Bonanjo District', 'Wouri River', 'Marché Central'],
      culture: 'Commercial hub with diverse ethnic groups. French and English spoken. Business capital of Cameroon.',
      tips: 'Best time to visit: December-February. Try local seafood and plantains. Use official taxis.',
      transport: 'Taxis, buses, and motorcycle taxis available. Airport connections to international destinations.'
    },
    'yaounde': {
      weather: 'Tropical climate, cooler than coast. Average 23°C. Two rainy seasons.',
      attractions: ['National Museum', 'Unity Palace', 'Mvog-Betsi Zoo', 'Bastos Quarter', 'Art Museum'],
      culture: 'Political capital with government institutions. Mix of traditional and modern architecture.',
      tips: 'Visit during dry season (November-March). Try local beer and grilled fish. Respect government areas.',
      transport: 'Well-connected by road. Central location for travel to all regions. Good bus network.'
    },
    'bamenda': {
      weather: 'Highland climate, cooler temperatures. Average 20°C. Dry season: November-March',
      attractions: ['Mankon Palace', 'Lake Awing', 'Ndop Plains', 'Traditional Markets', 'Ring Road'],
      culture: 'Rich Grassfields culture. Traditional kingdoms and crafts. English-speaking region.',
      tips: 'Bring warm clothes for evenings. Excellent for hiking and cultural tours. Respect traditional customs.',
      transport: 'Mountain roads, 4WD recommended for some areas. Beautiful scenic routes.'
    },
    'buea': {
      weather: 'Mountain climate, mild temperatures. Fog common. Average 18°C.',
      attractions: ['Mount Cameroon', 'Buea Market', 'German Colonial Architecture', 'Limbe Beach nearby', 'University of Buea'],
      culture: 'University town with vibrant student life. Historical German colonial influence.',
      tips: 'Perfect for mountain climbing. Visit Limbe for beaches. Pack rain gear and warm clothes.',
      transport: 'Good road connections to Douala. Base for Mount Cameroon expeditions.'
    }
  };

  // Check if query mentions any city
  const cities = Object.keys(travelInfo);
  const mentionedCity = cities.find(city => query.includes(city));
  
  if (mentionedCity) {
    const info = travelInfo[mentionedCity];
    return `🏙️ Here's information about ${mentionedCity.charAt(0).toUpperCase() + mentionedCity.slice(1)}:

🌤️ **Weather**: ${info.weather}

🏛️ **Attractions**: ${info.attractions.join(', ')}

🎭 **Culture**: ${info.culture}

💡 **Travel Tips**: ${info.tips}

🚌 **Transport**: ${info.transport}`;
  } else if (query.includes('weather') || query.includes('climate')) {
    return "🌤️ **Cameroon Weather Guide**:\n\n🏖️ **Coastal areas** (Douala, Limbe): Hot and humid, average 26°C\n🏔️ **Highlands** (Bamenda, Buea): Cooler, average 18-20°C\n🌧️ **Rainy season**: March-November (varies by region)\n☀️ **Best travel time**: November-March for most regions";
  } else if (query.includes('food') || query.includes('eat') || query.includes('dish')) {
    return "🍽️ **Popular Cameroonian Cuisine**:\n\n🥘 **Ndolé**: National dish with groundnuts and bitter leaves\n🍚 **Jollof rice**: Spiced rice dish\n🐟 **Grilled fish**: Fresh from coastal waters\n🍌 **Plantains**: Fried or boiled\n🥜 **Fufu**: Staple made from cassava\n🌽 **Koki**: Steamed black-eyed pea pudding\n\nEach region has unique specialties!";
  } else if (query.includes('language') || query.includes('speak')) {
    return "🗣️ **Languages in Cameroon**:\n\n🇫🇷 **French**: Official language (majority)\n🇬🇧 **English**: Official language (Northwest & Southwest)\n🌍 **Local languages**: Over 200 indigenous languages\n📍 **Bus stations**: Staff usually speak both French and English\n💬 **Tip**: Learn basic French or English phrases for easier travel";
  } else if (query.includes('safety') || query.includes('safe') || query.includes('security')) {
    return "🛡️ **Travel Safety Tips**:\n\n🚌 Use reputable bus companies\n💰 Keep valuables secure and hidden\n☀️ Travel during daylight when possible\n👀 Stay aware of your surroundings\n🏢 Bus stations generally have security\n📱 Keep emergency contacts handy\n🆔 Carry proper identification\n💡 Trust your instincts";
  } else if (query.includes('currency') || query.includes('money') || query.includes('pay')) {
    return "💰 **Currency & Payments**:\n\n💵 **Currency**: Central African CFA franc (XAF)\n🏧 **ATMs**: Available in major cities\n💳 **Credit cards**: Accepted in hotels and restaurants in big cities\n💸 **Cash**: Preferred for bus travel and local vendors\n🏪 **Exchange**: Banks and official exchange bureaus\n💡 **Tip**: Always carry some cash for transportation";
  } else if (query.includes('visa') || query.includes('passport') || query.includes('entry')) {
    return "📋 **Entry Requirements**:\n\n🛂 **Visa**: Required for most visitors\n📘 **Passport**: Must be valid for at least 6 months\n💉 **Vaccinations**: Yellow fever certificate often required\n🏢 **Embassy**: Check with local Cameroonian embassy for current requirements\n📝 **Documents**: Keep copies of important documents\n⏰ **Processing**: Apply for visa well in advance";
  } else if (query.includes('transport') || query.includes('travel') || query.includes('bus')) {
    return "🚌 **Transportation in Cameroon**:\n\n🚍 **Buses**: Main inter-city transport, various comfort levels\n🚕 **Taxis**: Available in cities, negotiate fare beforehand\n🏍️ **Motorcycle taxis**: Common for short distances\n✈️ **Flights**: Domestic flights between major cities\n🛣️ **Roads**: Vary in condition, some areas need 4WD\n💡 **Tip**: Book bus tickets in advance during peak seasons";
  } else if (query.includes('accommodation') || query.includes('hotel') || query.includes('stay')) {
    return "🏨 **Accommodation Options**:\n\n🌟 **Hotels**: From budget to luxury in major cities\n🏠 **Guesthouses**: Local, affordable options\n🎓 **University hostels**: Budget-friendly in university towns\n🏕️ **Camping**: Limited options, mainly near national parks\n💡 **Booking**: Reserve in advance, especially in tourist areas\n📱 **Apps**: Use international booking platforms for hotels";
  } else {
    return "🤖 **Cameroon Travel Assistant**\n\nI can help you with information about:\n\n🏙️ **Cities**: Douala, Yaoundé, Bamenda, Buea\n🌤️ **Weather & Climate**\n🍽️ **Food & Cuisine** \n🗣️ **Languages**\n🛡️ **Safety Tips**\n💰 **Currency & Money**\n📋 **Visa & Entry Requirements**\n🚌 **Transportation**\n🏨 **Accommodation**\n\n💬 Ask me anything about traveling in Cameroon!";
  }
}
