export async function POST(request) {
    const { message } = await request.json();
  
    // Predefined responses (you can replace this with a JSON dataset)
    const responses = {
      "What are your timings?": "We are open 24/7! Feel free to visit anytime.",
      "Do you have personal trainers?": "Yes, we have certified personal trainers available.",
      "What membership plans do you offer?": "We offer Basic, Pro, and Elite plans. Check our pricing section for details.",
      "Do you have group classes?": "Yes, we offer group fitness classes like yoga, HIIT, and more.",
      "What equipment do you have?": "We have state-of-the-art equipment for cardio, strength training, and functional fitness.",
      default: "I'm here to help! Ask me anything about the gym.",
    };
  
    // Find a response or use the default
    const reply = responses[message] || responses.default;
  
    return Response.json({ reply });
  }