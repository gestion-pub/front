'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Plus, Pencil, Trash } from '@phosphor-icons/react';

interface Client {
  nom: string;
  campagne: string; // 👉 هذا هو SPOT
  tel: string;
  email: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState<Client>({
    nom: '',
    campagne: '',
    tel: '',
    email: '',
  });

  /* ===== LOAD ===== */
  useEffect(() => {
    const stored = localStorage.getItem('clients_data');
    if (stored) setClients(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('clients_data', JSON.stringify(clients));
    localStorage.setItem(
      'clients',
      JSON.stringify(clients.map((c) => c.nom))
    );
  }, [clients]);

  /* ===== HANDLERS ===== */
  const saveClient = () => {
    if (!form.nom || !form.campagne) return;

    const updated =
      editIndex !== null
        ? clients.map((c, i) => (i === editIndex ? form : c))
        : [...clients, form];

    setClients(updated);
    setForm({ nom: '', campagne: '', tel: '', email: '' });
    setEditIndex(null);
    setOpen(false);
  };

  const editClient = (index: number) => {
    setForm(clients[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const deleteClient = (index: number) => {
    setClients(clients.filter((_, i) => i !== index));
  };

  /* ===== UI ===== */
  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Clients</Typography>
        <Button variant="contained" startIcon={<Plus />} onClick={() => setOpen(true)}>
          Add Client
        </Button>
      </Stack>

      {clients.map((c, i) => (
        <Box key={i} p={2} mb={2} border="1px solid #ddd" borderRadius={2}>
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Typography fontWeight={600}>{c.nom}</Typography>
              <Typography variant="body2">
                Spot: {c.campagne} | Tel: {c.tel} | {c.email}
              </Typography>
            </Box>
            <Stack direction="row">
              <IconButton onClick={() => editClient(i)}>
                <Pencil size={18} />
              </IconButton>
              <IconButton color="error" onClick={() => deleteClient(i)}>
                <Trash size={18} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      ))}

      {/* ===== DIALOG ===== */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editIndex !== null ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Nom client" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <TextField label="Spot (Campagne)" value={form.campagne} onChange={(e) => setForm({ ...form, campagne: e.target.value })} />
            <TextField label="Téléphone" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} />
            <TextField label="Email (.tn / .com)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveClient}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
