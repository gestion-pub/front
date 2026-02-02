'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  FormControlLabel as RadioLabel,
  Radio,
  InputAdornment,
} from '@mui/material';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface Campagne {
  id: number;
  client: string;
  spot: string;
  spot_id: number;
  prixHT: number;
  ranking: boolean;
  type: 'Classique' | 'Hors écran';
  categorie: string; // <-- nouveau
  dateDebut: string;
  dateFin: string;
}

export default function CampagnePage() {
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [spots, setSpots] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]); // <-- catégories
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<Omit<Campagne, 'id'>>({
    client: '',
    spot: '',
    spot_id: 0,
    prixHT: 0,
    ranking: true,
    type: 'Classique',
    categorie: '',
    dateDebut: '',
    dateFin: '',
  });

  /* ===== LOAD ===== */
  useEffect(() => {
    const c = localStorage.getItem('campagnes');
    if (c) setCampagnes(JSON.parse(c));

    const cl = localStorage.getItem('clients_data');
    if (cl) {
      const parsed = JSON.parse(cl);
      setClients(parsed.map((c: any) => c.nom));
      const uniqueSpots = Array.from(
        new Set(parsed.map((c: any) => c.campagne).filter(Boolean))
      );
      setSpots(uniqueSpots);
    }

    const cat = localStorage.getItem('categories');
    if (cat) {
      const parsed = JSON.parse(cat);
      setCategories(parsed.map((c: any) => (typeof c === 'string' ? c : c.nom)));
    }
  }, []);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAdd = () => {
    setEditingIndex(null);
    setForm({
      client: '',
      spot: '',
      spot_id: 0,
      prixHT: 0,
      ranking: true,
      type: 'Classique',
      categorie: '',
      dateDebut: '',
      dateFin: '',
    });
    setOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    const { id, ...rest } = campagnes[index];
    setForm(rest);
    setOpen(true);
  };

  const saveCampagne = () => {
    if (
      !form.client ||
      !form.spot ||
      form.spot_id <= 0 ||
      form.prixHT <= 0 ||
      !form.type ||
      !form.categorie ||
      !form.dateDebut ||
      !form.dateFin
    ) {
      return;
    }

    const updated =
      editingIndex !== null
        ? campagnes.map((c, i) =>
            i === editingIndex ? { id: campagnes[i].id, ...form } : c
          )
        : [...campagnes, { id: Date.now(), ...form }];

    setCampagnes(updated);
    localStorage.setItem('campagnes', JSON.stringify(updated));
    setOpen(false);
  };

  const deleteCampagne = (index: number) => {
    const updated = campagnes.filter((_, i) => i !== index);
    setCampagnes(updated);
    localStorage.setItem('campagnes', JSON.stringify(updated));
  };

  const filteredCampagnes = campagnes.filter((c) =>
    `${c.client} ${c.spot} ${c.spot_id} ${c.prixHT} ${c.type} ${c.categorie}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box p={4}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Campagnes</Typography>
        <Button variant="contained" onClick={openAdd}>Add Campagne</Button>
      </Stack>

      {/* SEARCH */}
      <TextField
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MagnifyingGlass size={18} />
            </InputAdornment>
          ),
        }}
      />

      {/* LIST */}
      <Grid container spacing={2}>
        {filteredCampagnes.length === 0 && (
          <Grid item xs={12}>
            <Typography>Aucune campagne</Typography>
          </Grid>
        )}

        {filteredCampagnes.map((c, index) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography fontWeight={600}>{c.spot}</Typography>
                  <Typography>Client: {c.client}</Typography>
                  <Typography>Spot ID: {c.spot_id}</Typography>
                  <Typography>Prix HT: {c.prixHT} DT</Typography>
                  <Typography>Type: {c.type}</Typography>
                  <Typography>Catégorie: {c.categorie}</Typography>
                  <Typography>Ranking: {c.ranking ? 'Active' : 'Non'}</Typography>
                  <Typography>{c.dateDebut} → {c.dateFin}</Typography>

                  <Stack direction="row" spacing={1} mt={1}>
                    <Button size="small" onClick={() => openEdit(index)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => deleteCampagne(index)}>Delete</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingIndex !== null ? 'Edit Campagne' : 'Add Campagne'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select value={form.client} label="Client" onChange={(e) => handleChange('client', e.target.value)}>
                {clients.map((c, i) => (
                  <MenuItem key={i} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Spot</InputLabel>
              <Select value={form.spot} label="Spot" onChange={(e) => handleChange('spot', e.target.value)}>
                {spots.map((s, i) => (
                  <MenuItem key={i} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Spot ID"
              type="number"
              value={form.spot_id}
              onChange={(e) => handleChange('spot_id', Number(e.target.value))}
            />

            <TextField
              label="Prix HT (DT)"
              type="number"
              value={form.prixHT}
              onChange={(e) => handleChange('prixHT', Number(e.target.value))}
            />

            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={form.categorie}
                label="Catégorie"
                onChange={(e) => handleChange('categorie', e.target.value)}
              >
                {categories.map((cat, i) => (
                  <MenuItem key={i} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <RadioGroup
                row
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <RadioLabel value="Classique" control={<Radio />} label="Classique" />
                <RadioLabel value="Hors écran" control={<Radio />} label="Hors écran" />
              </RadioGroup>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.ranking}
                  onChange={(e) => handleChange('ranking', e.target.checked)}
                />
              }
              label="Ranking Active"
            />

            <TextField
              type="date"
              label="Date début"
              InputLabelProps={{ shrink: true }}
              value={form.dateDebut}
              onChange={(e) => handleChange('dateDebut', e.target.value)}
            />

            <TextField
              type="date"
              label="Date fin"
              InputLabelProps={{ shrink: true }}
              value={form.dateFin}
              onChange={(e) => handleChange('dateFin', e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCampagne}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
