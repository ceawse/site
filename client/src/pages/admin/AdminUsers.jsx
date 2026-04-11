import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
  Tabs, Tab, Select, MenuItem, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageData, setMessageData] = useState({ subject: '', content: '' });
  const [sending, setSending] = useState(false);
  const [depDialogOpen, setDepDialogOpen] = useState(false);
  const [newDepName, setNewDepName] = useState('');
  const [editingDepId, setEditingDepId] = useState(null);
  const [editDepName, setEditDepName] = useState('');

  const getOnlineStatus = (lastSeen) => {
    if (!lastSeen) return { online: false, text: 'Никогда' };
    const lastDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastDate) / 60000);
    if (diffInMinutes < 5) {
      return { online: true, text: 'Online' };
    } else {
      return { online: false, text: lastDate.toLocaleString() };
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, depsData] = await Promise.all([
        api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
        api.get('/admin/departments')
      ]);
      setUsers(usersData);
      setDepartments(depsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessage = (user) => {
    setSelectedUser(user);
    setMessageData({ subject: '', content: '' });
    setMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageData.subject || !messageData.content) return;
    try {
      setSending(true);
      await api.post('/admin/messages', {
        user_id: selectedUser.id,
        subject: messageData.subject,
        content: messageData.content
      });
      setMessageDialogOpen(false);
      alert(t('admin.users.dialog.success', 'Message sent successfully'));
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(t('admin.users.dialog.failed', 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepName.trim()) return;
    try {
      await api.post('/admin/departments', { name: newDepName });
      setNewDepName('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error creating department');
    }
  };

  const handleRenameDepartment = async (id) => {
    if (!editDepName.trim()) return;
    try {
      await api.put(`/admin/departments/${id}`, { name: editDepName });
      setEditingDepId(null);
      setEditDepName('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error updating department');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm(t('common.confirm_delete', 'Are you sure you want to delete this department?'))) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      setDepartments(departments.filter(d => d.id !== id));
      if (selectedTab === id) setSelectedTab('all');
    } catch (err) {
      console.error(err);
      alert('Error deleting department');
    }
  };

  const handleChangeUserDepartment = async (userId, newDepId) => {
    try {
      await api.put(`/admin/users/${userId}/department`, { department_id: newDepId });
      setUsers(users.map(u => u.id === userId ? { ...u, department_id: newDepId } : u));
    } catch (err) {
      console.error(err);
      alert('Error moving user to department');
    }
  };

  const filteredUsers = selectedTab === 'all'
      ? users
      : users.filter(u => u.department_id === selectedTab || (!u.department_id && selectedTab === 1));

  return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('admin.users.management')}</Typography>
          <Button variant="outlined" onClick={() => setDepDialogOpen(true)}>
            {t('admin.departments.manage', 'Управление отделами')}
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
          <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Поиск по имени, email или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                ),
              }}
          />
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)} variant="scrollable" scrollButtons="auto">
            <Tab label={t('admin.departments.all', 'Все клиенты')} value="all" />
            {departments.map(dep => (
                <Tab key={dep.id} label={dep.name} value={dep.id} />
            ))}
          </Tabs>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.users.table.id')}</TableCell>
                <TableCell>{t('admin.users.table.name')}</TableCell>
                <TableCell>{t('admin.users.table.email')}</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>{t('admin.users.table.department', 'Отдел')}</TableCell>
                <TableCell>{t('admin.users.table.role')}</TableCell>
                <TableCell>{t('admin.users.table.verified')}</TableCell>
                <TableCell>{t('admin.users.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
              ) : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {(() => {
                        const status = getOnlineStatus(user.last_seen);
                        return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                width: 8, height: 8, borderRadius: '50%',
                                bgcolor: status.online ? '#22c55e' : '#cbd5e1'
                              }} />
                              <Typography variant="caption" sx={{ color: status.online ? '#22c55e' : 'text.secondary', whiteSpace: 'nowrap' }}>
                                {status.online ? 'Online' : status.text}
                              </Typography>
                            </Box>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Select
                          size="small"
                          value={user.department_id || 1}
                          onChange={(e) => handleChangeUserDepartment(user.id, e.target.value)}
                          sx={{ minWidth: 120 }}
                      >
                        {departments.map(dep => (
                            <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                          label={t(`admin.users.roles.${user.role}`)}
                          color={user.role === 'admin' ? 'secondary' : 'default'}
                          size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                          label={user.verified ? t('common.yes') : t('common.no')}
                          color={user.verified ? 'success' : 'error'}
                          size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        {t('admin.users.edit')}
                      </Button>
                      <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                          onClick={() => handleOpenMessage(user)}
                      >
                        {t('admin.users.message')}
                      </Button>
                    </TableCell>
                  </TableRow>
              ))}
              {!loading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">{t('admin.users.no_users')}</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
                open={messageDialogOpen}
                onClose={() => setMessageDialogOpen(false)}
                fullWidth
                maxWidth="md"
              >
                <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                  {t('admin.users.dialog.title', { name: selectedUser?.name })}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label={t('admin.users.dialog.subject')}
                    value={messageData.subject}
                    onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    fullWidth
                    label={t('admin.users.dialog.message')}
                    multiline
                    rows={12}
                    value={messageData.content}
                    onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                    placeholder="Введите ваше сообщение здесь..."
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Прикрепить документ или изображение:
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 1.5, borderStyle: 'dashed' }}
                    >
                      {t('common.upload_file', 'Загрузить файл')}
                      <input type="file" hidden />
                    </Button>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
                  <Button
                    onClick={() => setMessageDialogOpen(false)}
                    sx={{ color: '#64748b', fontWeight: 600 }}
                  >
                    {t('admin.users.dialog.cancel')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={sending || !messageData.subject || !messageData.content}
                    sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700, bgcolor: '#4F46E5' }}
                  >
                    {sending ? <CircularProgress size={20} /> : t('admin.users.dialog.send')}
                  </Button>
                </DialogActions>
              </Dialog>

        <Dialog open={depDialogOpen} onClose={() => setDepDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('admin.departments.manage', 'Управление отделами')}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                  size="small"
                  fullWidth
                  placeholder={t('admin.departments.new_name', 'Название нового отдела')}
                  value={newDepName}
                  onChange={e => setNewDepName(e.target.value)}
              />
              <Button variant="contained" onClick={handleCreateDepartment}>{t('common.add', 'Добавить')}</Button>
            </Box>
            <List>
              {departments.map(dep => (
                  <ListItem key={dep.id} divider>
                    {editingDepId === dep.id ? (
                        <>
                          <TextField
                              size="small"
                              fullWidth
                              value={editDepName}
                              onChange={e => setEditDepName(e.target.value)}
                              sx={{ mr: 2 }}
                          />
                          <IconButton color="primary" onClick={() => handleRenameDepartment(dep.id)}>
                            <SaveIcon />
                          </IconButton>
                        </>
                    ) : (
                        <>
                          <ListItemText primary={dep.name} />
                          <ListItemSecondaryAction>
                            <IconButton onClick={() => { setEditingDepId(dep.id); setEditDepName(dep.name); }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton edge="end" color="error" onClick={() => handleDeleteDepartment(dep.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </>
                    )}
                  </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDepDialogOpen(false)}>{t('common.close', 'Закрыть')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}