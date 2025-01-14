require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// AI 클라이언트 초기화
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/compare', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // 마크다운 포맷팅 함수
    const formatResponse = (text) => {
      return text
        .replace(/\n/g, '\n\n')  // 줄바꿈 2번으로 변경
        .replace(/```([^\n]*)\n([\s\S]*?)```/g, '\n```$1\n$2\n```\n')  // 코드블록 포맷팅
        .replace(/\*\*(.*?)\*\*/g, '**$1**')  // 볼드체 보존
        .trim();
    };

    const [gptResponse, geminiResponse, claudeResponse] = await Promise.all([
      // GPT-4 Turbo
      openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [{ 
          role: "user", 
          content: prompt + "\n\n답변을 작성할 때 마크다운 문법을 사용해주세요. 줄바꿈과 단락을 명확하게 구분해주세요." 
        }]
      }),
      
      // Gemini Pro
      genAI.getGenerativeModel({ model: "gemini-pro" })
        .generateContent(prompt + "\n\n답변을 작성할 때 마크다운 문법을 사용해주세요. 줄바꿈과 단락을 명확하게 구분해주세요."),
      
      // Claude 3 Opus
      anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [{ 
          role: "user", 
          content: prompt + "\n\n답변을 작성할 때 마크다운 문법을 사용해주세요. 줄바꿈과 단락을 명확하게 구분해주세요." 
        }]
      })
    ]);

    res.json({
      gpt: formatResponse(gptResponse.choices[0].message.content),
      gemini: formatResponse(geminiResponse.response.text()),
      claude: formatResponse(claudeResponse.content[0].text)
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 