import React, { useEffect, useState } from 'react';
import {
  Typography,
  CircularProgress,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { db } from '../firebase';


const FormAnalytics = ({ formId }) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const formDoc = await getDoc(doc(db, 'forms', formId));
        if (!formDoc.exists()) {
          console.log('Form not found');
          setLoading(false);
          return;
        }

        const formConfig = formDoc.data().formConfig;
        setFormTitle(formConfig.formTitle || 'Form Analytics');

        const analyticsFields = [];
        const supportedTypes = ['radio', 'select', 'checkbox', 'boolean', 'ranking'];

        formConfig.pages.forEach((page, pageIndex) => {
          page.fields.forEach((field, fieldIndex) => {
            if (supportedTypes.includes(field.type)) {
              analyticsFields.push({
                ...field,
                pageIndex,
                fieldIndex,
                pageTitle: page.title
              });
            }
          });
        });

        const q = query(collection(db, 'formSubmissions'), where('formId', '==', formId));
        const snapshot = await getDocs(q);
        
        setTotalSubmissions(snapshot.size);

        const processedAnalytics = analyticsFields.map(field => {
          const fieldData = processFieldData(field, snapshot);
          return {
            field,
            ...fieldData
          };
        });

        setAnalyticsData(processedAnalytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [formId]);

  const processFieldData = (field, snapshot) => {
    const optionCounts = {};
    let totalResponses = 0;

    snapshot.forEach(doc => {
      const formData = doc.data().formData || {};
      const userAnswer = formData[field.id];

      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        totalResponses++;

        switch (field.type) {
          case 'radio':
          case 'select':
            optionCounts[userAnswer] = (optionCounts[userAnswer] || 0) + 1;
            break;

          case 'checkbox':
            if (Array.isArray(userAnswer)) {
              userAnswer.forEach(option => {
                optionCounts[option] = (optionCounts[option] || 0) + 1;
              });
            }
            break;

          case 'boolean':
            { const booleanValue = userAnswer === 'yes' ? 'Yes' : 'No';
            optionCounts[booleanValue] = (optionCounts[booleanValue] || 0) + 1;
            break; }

          case 'ranking':
            if (typeof userAnswer === 'object' && userAnswer !== null) {
              Object.keys(userAnswer).forEach(option => {
                const rank = userAnswer[option];
                const rankLabel = `${option} (Rank ${rank})`;
                optionCounts[rankLabel] = (optionCounts[rankLabel] || 0) + 1;
              });
            }
            break;
        }
      }
    });

    const chartData = Object.entries(optionCounts)
      .map(([option, count]) => ({
        name: option,
        count: count,
        percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      chartData,
      totalResponses,
      optionCounts
    };
  };

  const renderChart = (analytics, index) => {
    const { field, chartData, totalResponses } = analytics;

    if (chartData.length === 0) {
      return null;
    }

    return (
      <Grid item xs={12}  key={`${field.id}-${index}`}>
        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ fontSize: '1.1rem' }}>
              {field.label}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`${totalResponses} responses`} 
                size="small" 
                color="info" 
                variant="outlined" 
              />
              <Chip 
                label={field.type.charAt(0).toUpperCase() + field.type.slice(1)} 
                size="small" 
                variant="outlined" 
              />
            </Box>

            <Box sx={{ height: 300, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    // angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    fontSize={11}
                  />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}  `, 'Count']}
                    cursor={false}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#1976d2"
                    radius={[2, 2, 0, 0]}
                    
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>


      
          </CardContent>
        </Card>
      </Grid>
    );
  };
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Generating Analytics...</Typography>
      </Box>
    );
  }

  if (analyticsData.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Analytics Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No supported field types (radio, checkbox, dropdown, yes/no, ranking) found in this form.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 ,width: '100%'}}>
        <Typography variant="h4" gutterBottom color="primary">
          {formTitle}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total Submissions: ${totalSubmissions}`} 
            color="primary" 
            variant="filled" 
          />
          {/* <Chip 
            label={`Questions Analyzed: ${analyticsData.length}`} 
            color="secondary" 
            variant="outlined" 
          /> */}
        </Box>
      </Paper>

      {/* Charts Grid */}
      <Grid container spacing={3}  sx={{ width: '100%' }}>
        {analyticsData.map((analytics, index) => (
          <Grid item xs={12} key={index} sx={{ width: '100%' }}>
            {renderChart(analytics, index)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FormAnalytics;