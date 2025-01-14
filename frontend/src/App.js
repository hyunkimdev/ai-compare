import React, { useState } from 'react';
import { 
  Container, Grid, TextField, Button, Card, 
  CardContent, Typography, CircularProgress 
} from '@mui/material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({ gpt: '', gemini: '', claude: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/compare`,
        { prompt }
      );
      setResponses(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        AI 모델 비교
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="프롬프트를 입력하세요..."
          margin="normal"
        />
        <Button 
          fullWidth 
          variant="contained" 
          type="submit"
          disabled={loading}
          sx={{ mt: 2, mb: 4 }}
        >
          {loading ? <CircularProgress size={24} /> : '응답 받기'}
        </Button>
      </form>

      <Grid container spacing={3}>
        {['GPT-4', 'Gemini', 'Claude'].map((model, index) => (
          <Grid item xs={12} md={4} key={model}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {model}
                </Typography>
                <Typography variant="body2">
                  <ReactMarkdown>
                    {responses[model.toLowerCase().replace('-4', '')] || '응답을 기다리는 중...'}
                  </ReactMarkdown>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;