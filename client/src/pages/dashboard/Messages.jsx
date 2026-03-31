import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Grid, TextField, Button, Tabs, Tab,
  List, ListItem, ListItemText, Divider, Chip, CircularProgress, Alert, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { api } from '../../api';

const Messages = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ subject: '', content: '' });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.get('/messages');
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages', err);
      setError(t('dashboard.messages.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.content) {
      setError(t('dashboard.messages.errors.fill_all'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const payload = new FormData();
      payload.append('subject', formData.subject);
      payload.append('content', formData.content);
      if (formData.thread_id) payload.append('thread_id', formData.thread_id);
      if (attachment) payload.append('attachment', attachment);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setSuccess(t('dashboard.messages.success_send'));
      setFormData({ subject: '', content: '' });
      setAttachment(null);
      fetchMessages();
      setTabValue(0); // Switch to messages list
    } catch (err) {
      console.error('Error sending message', err);
      setError(t('dashboard.messages.errors.send_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error('Error marking message as read', err);
    }
  };

  const handleOpenDetail = (msg) => {
    setSelectedMsg(msg);
    // Find all messages in this thread
    const threadMessages = messages.filter(m => m.thread_id === msg.thread_id).sort((a, b) => a.id - b.id);
    setSelectedMsg({ ...msg, thread: threadMessages });
    setDetailOpen(true);
    if (msg.status === 'unread' && msg.sender_role === 'admin') {
      markAsRead(msg.id);
    }
  };

  const handleReply = () => {
    if (!selectedMsg) return;
    setDetailOpen(false);
    setTabValue(1);
    setFormData({
      subject: selectedMsg.subject.startsWith('Re:') ? selectedMsg.subject : `Re: ${selectedMsg.subject}`,
      content: '',
      thread_id: selectedMsg.thread_id
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.messages.title')}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          <Tab label={t('dashboard.messages.tabs.list')} />
          <Tab label={t('dashboard.messages.tabs.new')} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : messages.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#64748b', py: 8, textAlign: 'center' }}>
              {t('dashboard.messages.no_messages')}
            </Typography>
          ) : (
            <List disablePadding>
              {Object.values(messages.reduce((acc, m) => {
                if (!acc[m.thread_id] || new Date(m.date) > new Date(acc[m.thread_id].date)) {
                  acc[m.thread_id] = m;
                }
                return acc;
              }, {})).sort((a, b) => new Date(b.date) - new Date(a.date)).map((msg, idx, arr) => (
                <React.Fragment key={msg.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      p: 3,
                      bgcolor: msg.status === 'unread' && msg.sender_role === 'admin' ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8fafc' }
                    }}
                    onClick={() => handleOpenDetail(msg)}
                  >
                    <ListItemText
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={msg.status === 'unread' ? 700 : 500} color="text.primary">
                            {msg.subject}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {msg.status === 'unread' && msg.sender_role === 'admin' && (
                              <Chip label={t('dashboard.messages.new_badge')} size="small" color="primary" sx={{ mr: 1, height: 20, fontSize: 10 }} />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(msg.date)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < arr.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}

      {tabValue === 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', width: '100%', maxWidth: 600 }}>
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

              <Stack spacing={3} alignItems="center">
                <TextField
                  fullWidth
                  label={t('dashboard.messages.subject_label')}
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label={t('dashboard.messages.content_label')}
                  name="content"
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                <Box sx={{ width: '100%' }}>
                  <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none' }}>
                    {attachment ? attachment.name : t('common.upload_file', 'Загрузить файл')}
                    <input type="file" hidden onChange={(e) => setAttachment(e.target.files[0])} />
                  </Button>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  fullWidth
                  sx={{
                    borderRadius: 1.5,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' }
                  }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : t('dashboard.messages.send_button')}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      )}
      {/* Message Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{selectedMsg?.subject}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDate(selectedMsg?.date)}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedMsg?.thread ? (
            <Stack spacing={2}>
              {selectedMsg.thread.map((m) => (
                <Box key={m.id} sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: m.sender_role === 'admin' ? '#f1f5f9' : '#e0e7ff',
                  alignSelf: m.sender_role === 'admin' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    {m.sender_role === 'admin' ? 'AlpenStark Support' : 'You'} • {formatDate(m.date)}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.content}</Typography>
                  {m.attachment && (
                    <Box sx={{ mt: 1 }}>
                      <a href={`/api/${m.attachment}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'underline', fontSize: '0.875rem' }}>
                        {t('common.view_attachment', 'Посмотреть вложение')}
                      </a>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.6 }}>
                {selectedMsg?.content}
              </Typography>
              {selectedMsg?.attachment && (
                <Box sx={{ mt: 2 }}>
                  <a href={`/api/${selectedMsg.attachment}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'underline', fontSize: '0.875rem' }}>
                    {t('common.view_attachment', 'Посмотреть вложение')}
                  </a>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          {selectedMsg?.sender_role === 'admin' && (
            <Button onClick={handleReply} variant="outlined" sx={{ textTransform: 'none' }}>
              {t('dashboard.messages.dialog.reply')}
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>{t('dashboard.messages.dialog.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
