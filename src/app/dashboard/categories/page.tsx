'use client';

import { useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Plus, Pencil, Trash } from '@phosphor-icons/react';

/* ================= TYPE ================= */

interface Categorie {
  id: number;
  nom: string;
}

/* ================= PAGE ================= */

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [form, setForm] = useState<{ nom: string }>({ nom: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState(''); // <-- pour la recherche

  /* ================= LOAD ================= */

  useEffect(() => {
    const stored = localStorage.getItem('categories');
    if (stored) {
      setCategories(JSON.parse(stored));
    }
  }, []);

  /* ================= HELPERS ================= */

  const getNextId = () => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.id)) + 1;
  };

  const saveToStorage = (data: Categorie[]) => {
    setCategories(data);
    localStorage.setItem('categories', JSON.stringify(data));
  };

  /* ================= ACTIONS ================= */

  const handleAddClick = () => {
    setForm({ nom: '' });
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleEdit = (cat: Categorie) => {
    setForm({ nom: cat.nom });
    setEditingId(cat.id);
    setOpenDialog(true);
  };

  const handleDelete = (id: number) => {
    const updated = categories.filter((c) => c.id !== id);
    saveToStorage(updated);
  };

  const handleSave = () => {
    if (!form.nom.trim()) return;

    if (editingId !== null) {
      const updated = categories.map((c) =>
        c.id === editingId ? { ...c, nom: form.nom } : c
      );
      saveToStorage(updated);
    } else {
      const newCat: Categorie = {
        id: getNextId(),
        nom: form.nom,
      };
      saveToStorage([...categories, newCat]);
    }

    setOpenDialog(false);
    setForm({ nom: '' });
    setEditingId(null);
  };

  /* ================= FILTRAGE ================= */

  const filteredCategories = categories.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) || // nom contient la recherche
      c.id.toString().includes(search) // ID contient la recherche
  );

  /* ================= UI ================= */

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Catégories</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleAddClick}
        >
          Add Catégorie
        </Button>
      </Stack>

      {/* Zone de recherche */}
      <TextField
        placeholder="Rechercher par ID ou nom..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom catégorie</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Aucune catégorie
                </TableCell>
              </TableRow>
            )}

            {filteredCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>{cat.nom}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(cat)}>
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(cat.id)}>
                    <Trash size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId !== null ? 'Edit Catégorie' : 'Add Catégorie'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nom catégorie"
              value={form.nom}
              onChange={(e) => setForm({ nom: e.target.value })}
              fullWidth
              autoFocus
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
