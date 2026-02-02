'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { Plus, Pencil, Trash } from '@phosphor-icons/react';

/* ================= TYPE ================= */

interface Conducteur {
  id: number;
  heures: string;
  nomClient: string;
  spot: string;
  duree: string;
  spot_id: number;
}

/* ================= PAGE ================= */

export default function ConducteursPage() {
  const [conducteurs, setConducteurs] = useState<Conducteur[]>([
    { id: 1, heures: '10:00', nomClient: 'Client A', spot: 'Spot 1', duree: '30min', spot_id: 101 },
    { id: 2, heures: '11:00', nomClient: 'Client B', spot: 'Spot 2', duree: '45min', spot_id: 102 },
  ]);

  const [form, setForm] = useState<Conducteur>({
    id: 0,
    heures: '',
    nomClient: '',
    spot: '',
    duree: '',
    spot_id: 0,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  /* ================= ACTIONS ================= */

  const handleAddClick = () => {
    setForm({ id: Date.now(), heures: '', nomClient: '', spot: '', duree: '', spot_id: 0 });
    setEditingIndex(null);
    setOpenDialog(true);
  };

  const handleEdit = (index: number) => {
    setForm(conducteurs[index]);
    setEditingIndex(index);
    setOpenDialog(true);
  };

  const handleDelete = (id: number) => {
    setConducteurs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    if (!form.nomClient.trim() || !form.spot.trim()) return;

    if (editingIndex !== null) {
      const updated = [...conducteurs];
      updated[editingIndex] = form;
      setConducteurs(updated);
    } else {
      setConducteurs([...conducteurs, form]);
    }

    setOpenDialog(false);
    setForm({ id: 0, heures: '', nomClient: '', spot: '', duree: '', spot_id: 0 });
    setEditingIndex(null);
  };

  /* ================= UI ================= */

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Conducteurs</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleAddClick}
        >
          Manage Conducteur
        </Button>
      </Stack>

      {/* List */}
      <Box sx={{ border: '1px solid #ddd', borderRadius: 2 }}>
        {conducteurs.length === 0 && (
          <Typography p={3}>Aucune donnée</Typography>
        )}

        {conducteurs.map((c, index) => (
          <Box key={c.id}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              <Stack spacing={0.5}>
                <Typography fontWeight={600}>{c.nomClient}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {c.id} | Heures: {c.heures} | Spot: {c.spot} | Durée: {c.duree} | Spot ID: {c.spot_id}
                </Typography>
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => handleEdit(index)}>
                  <Pencil size={18} />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(c.id)}>
                  <Trash size={18} />
                </IconButton>
              </Stack>
            </Stack>
            <Divider />
          </Box>
        ))}
      </Box>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingIndex !== null ? 'Edit Conducteur' : 'Add Conducteur'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ID"
              value={form.id}
              disabled
              fullWidth
            />
            <TextField
              label="Heures"
              value={form.heures}
              onChange={(e) => setForm({ ...form, heures: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Nom Client"
              value={form.nomClient}
              onChange={(e) => setForm({ ...form, nomClient: e.target.value })}
              fullWidth
            />
            <TextField
              label="Spot"
              value={form.spot}
              onChange={(e) => setForm({ ...form, spot: e.target.value })}
              fullWidth
            />
            <TextField
              label="Durée"
              value={form.duree}
              onChange={(e) => setForm({ ...form, duree: e.target.value })}
              fullWidth
            />
            <TextField
              label="Spot ID"
              type="number"
              value={form.spot_id}
              onChange={(e) => setForm({ ...form, spot_id: Number(e.target.value) })}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
