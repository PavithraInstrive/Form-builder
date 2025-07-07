import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  LinearProgress,
  Divider,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FormResults = () => {
  const navigate = useNavigate();
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    const resultsData = localStorage.getItem('formSubmissionResults');
    if (resultsData) {
      try {
        setSubmissionData(JSON.parse(resultsData));
      } catch (error) {
        console.error('Failed to load submission results:', error);
      }
    }
  }, []);

  const handleBackToForm = () => {
    navigate('/preview');
  };

  const handleRetakeForm = () => {
    // Clear form data and go back to preview
    localStorage.removeItem('formSubmissionResults');
    navigate('/preview');
  };

  const handleBackToBuilder = () => {
    navigate('/');
  };

  if (!submissionData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Results Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please submit a form to see results.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToForm}
            startIcon={<ArrowBackIcon />}
          >
            Go to Form
          </Button>
        </Paper>
      </Container>
    );
  }

  const { results, totalQuestions, correctAnswers, score, submittedAt } = submissionData;

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatAnswer = (answer, fieldType) => {
    if (fieldType === 'checkbox' && Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(', ') : 'No selections';
    }
    return answer || 'No answer';
  };

  return (
    <>
     
      <Container maxWidth="lg" sx={{ py: 4 }}>
         <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
        <Toolbar >
            <Box sx={{width:"100%", display: 'flex', justifyContent: 'space-between'}}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToForm}
            sx={{ mr: 2 }}
          >
            Back to Form
          </Button>
          <Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRetakeForm}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Retake Form
            </Button>
            <Button
              onClick={handleBackToBuilder}
              variant="outlined"
              size="small"
            >
              Form Builder
            </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
                <Typography variant="h5" gutterBottom>
            Form Results :
          </Typography>
        <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>

          
          <Grid container spacing={3} >
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, backgroundColor: getScoreColor(score) === 'success' ? 'success.50' : 
                         getScoreColor(score) === 'warning' ? 'warning.50' : 'error.50' }}>
                <Typography variant="h6" color={`${getScoreColor(score)}.main`}>
                  {score}%
                </Typography>
                <Typography variant="h6">Overall Score</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" color="success.main">
                  {correctAnswers}
                </Typography>
                <Typography variant="h6">Correct Answers</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" color="primary.main">
                  {totalQuestions}
                </Typography>
                <Typography variant="h6">Total Questions</Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
       <Typography variant="h5" gutterBottom>
            Detailed Results
          </Typography>
        {/* Detailed Results */}
        <Paper elevation={3} sx={{ p: 3 }}>
   

          {results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No questions with correct answers were found in this form.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {results.map((result, index) => (
                // <Card 
                //   key={result.fieldId} 
                //   sx={{ 
                //     border: '2px solid',
                //     borderColor: result.isCorrect ? 'success.main' : 'error.main',
                //     backgroundColor: result.isCorrect ? 'success.50' : 'error.50'
                //   }}
                // >
                //   <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ mr: 2 }}>
                        {result.isCorrect ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          Question {index + 1}: {result.fieldLabel}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Your Answer:
                            </Typography>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                backgroundColor: 'background.default',
                                border: '1px solid',
                                borderColor: result.isCorrect ? 'success.main' : 'error.main'
                              }}
                            >
                              <Typography variant="body1">
                                {formatAnswer(result.userAnswer, result.fieldType)}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Correct Answer:
                            </Typography>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                backgroundColor: 'success.50',
                                border: '1px solid',
                                borderColor: 'success.main'
                              }}
                            >
                              <Typography variant="body1">
                                {formatAnswer(result.correctAnswer, result.fieldType)}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                //   </CardContent>
                // </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default FormResults;