import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  List, ListItem, ListItemText, Divider, Chip, CircularProgress, Alert,
  Avatar, ListItemAvatar, Dialog, DialogTitle, DialogContent, DialogActions,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

const AdminMessages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyData, setReplyData] = useState({ subject: '', content: '' });
  const [replyAttachment, setReplyAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/messages');
      setMessages(data);
    } catch (err) {
      console.error('Error fetching admin messages', err);
      setError(t('admin.messages.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenReply = (msg) => {
    setSelectedUser({ id: msg.user_id, name: msg.user_name, email: msg.user_email });
    setReplyData({ 
      subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`, 
      content: '',
      thread_id: msg.thread_id
    });
    setReplyDialogOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyData.content) return;

    try {
      setSubmitting(true);
      
      const payload = new FormData();
      payload.append('user_id', selectedUser.id);
      payload.append('subject', replyData.subject);
      payload.append('content', replyData.content);
      if (replyData.thread_id) payload.append('thread_id', replyData.thread_id);
      if (replyAttachment) payload.append('attachment', replyAttachment);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      if (!response.ok) throw new Error('Failed to send reply');

      setReplyDialogOpen(false);
      setReplyData({ subject: '', content: '' });
      setReplyAttachment(null);
      fetchMessages();
    } catch (err) {
      console.error('Error sending reply', err);
      alert(t('admin.messages.dialog.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        {t('admin.messages.title')}
      </Typography>

      <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#64748b', py: 8, textAlign: 'center' }}>
            {t('admin.messages.no_messages')}
          </Typography>
        ) : (
          <List disablePadding>
            {messages.map((msg, idx) => (
              <React.Fragment key={msg.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    p: 3, 
                    bgcolor: msg.sender_role === 'user' ? '#f8fafc' : 'transparent',
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: msg.sender_role === 'user' ? 'primary.main' : 'secondary.main' }}>
                      {msg.user_name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {msg.sender_role === 'user' ? msg.user_name : t('admin.messages.admin_label', { name: msg.user_name })}
                          </Typography>
                          <Link
                            component="button"
                            variant="caption"
                            onClick={() => navigate(`/admin/users/${msg.user_id}`)}
                            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            ({t('admin.messages.view_profile')})
                          </Link>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ ml: 1 }}>
                            : {msg.subject}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(msg.date)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                          {msg.content}
                        </Typography>
                        {msg.attachment && (
                          <Box sx={{ mb: 2 }}>
                            <a href={`/api/${msg.attachment}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'underline', fontSize: '0.875rem' }}>
                              {t('common.view_attachment', 'Посмотреть вложение')}
                            </a>
                          </Box>
                        )}
                        {msg.sender_role === 'user' && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => handleOpenReply(msg)}
                            sx={{ textTransform: 'none' }}
                          >
                            {t('admin.messages.reply_button')}
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {idx < messages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('admin.messages.dialog.title', { name: selectedUser?.name })}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label={t('admin.messages.dialog.subject')}
              value={replyData.subject}
              onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('admin.messages.dialog.message')}
              multiline
              rows={4}
              value={replyData.content}
              onChange={(e) => setReplyData({ ...replyData, content: e.target.value })}
            />
            <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none' }}>
              {replyAttachment ? replyAttachment.name : t('common.upload_file', 'Загрузить файл')}
              <input type="file" hidden onChange={(e) => setReplyAttachment(e.target.files[0])} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReplyDialogOpen(false); setReplyAttachment(null); }}>{t('admin.messages.dialog.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleReplySubmit}
            disabled={submitting || !replyData.content}
          >
            {submitting ? <CircularProgress size={20} /> : t('admin.messages.dialog.send')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMessages;
