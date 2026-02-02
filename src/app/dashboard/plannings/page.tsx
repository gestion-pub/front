'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { CompaniesFilters } from '@/components/dashboard/plannings/plannings-filters';

/* ---------------- TYPES ---------------- */
type PlanningDate = {
  date: string;
  hours: string[];
};

type PlanningFormData = {
  spot: string;
  duree: string;
  prixHT: string;
  dates: PlanningDate[];
};

/* ---------------- PAGE ---------------- */
export default function Page() {
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<PlanningFormData>({
    spot: '',
    duree: '',
    prixHT: '',
    dates: [{ date: '', hours: [''] }],
  });

  const [plannings, setPlannings] = React.useState<PlanningDate[]>([]);

  /* -------- Form handlers -------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addDate = () => {
    setForm({
      ...form,
      dates: [...form.dates, { date: '', hours: [''] }],
    });
  };

  const removeDate = (index: number) => {
    setForm({
      ...form,
      dates: form.dates.filter((_, i) => i !== index),
    });
  };

  const updateDate = (index: number, value: string) => {
    const updated = [...form.dates];
    updated[index].date = value;
    setForm({ ...form, dates: updated });
  };

  const addHour = (dateIndex: number) => {
    const updated = [...form.dates];
    updated[dateIndex].hours.push('');
    setForm({ ...form, dates: updated });
  };

  const removeHour = (dateIndex: number, hourIndex: number) => {
    const updated = [...form.dates];
    updated[dateIndex].hours = updated[dateIndex].hours.filter(
      (_, i) => i !== hourIndex
    );
    setForm({ ...form, dates: updated });
  };

  const updateHour = (dateIndex: number, hourIndex: number, value: string) => {
    const updated = [...form.dates];
    updated[dateIndex].hours[hourIndex] = value;
    setForm({ ...form, dates: updated });
  };

  const handleSave = () => {
    setPlannings([...plannings, ...form.dates]);
    setForm({ spot: '', duree: '', prixHT: '', dates: [{ date: '', hours: [''] }] });
    setOpen(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Plannings</Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" startIcon={<UploadIcon />}>
              Import
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon />}>
              Export
            </Button>
          </Stack>
        </Stack>
        <Button variant="contained" startIcon={<PlusIcon />} onClick={() => setOpen(true)}>
          Add
        </Button>
      </Stack>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Add Plannings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            {form.dates.map((d, dateIndex) => (
              <Box key={dateIndex} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="date"
                    label="Date"
                    value={d.date}
                    onChange={(e) => updateDate(dateIndex, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  {form.dates.length > 1 && (
                    <Button color="error" onClick={() => removeDate(dateIndex)}>
                      ✕
                    </Button>
                  )}
                </Stack>
                <Stack spacing={2} mt={2}>
                  {d.hours.map((hour, hourIndex) => (
                    <Stack key={hourIndex} direction="row" spacing={2} alignItems="center">
                      <TextField
                        type="time"
                        label={`Hour ${hourIndex + 1}`}
                        value={hour}
                        onChange={(e) => updateHour(dateIndex, hourIndex, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      {d.hours.length > 1 && (
                        <Button color="error" onClick={() => removeHour(dateIndex, hourIndex)}>
                          ✕
                        </Button>
                      )}
                    </Stack>
                  ))}
                  <Button variant="outlined" onClick={() => addHour(dateIndex)}>
                    + Add hour
                  </Button>
                </Stack>
              </Box>
            ))}
            <Button variant="contained" onClick={addDate}>
              + Add new date
            </Button>

            <TextField label="Spot" name="spot" value={form.spot} onChange={handleChange} />
            <TextField label="Durée (h)" type="number" name="duree" value={form.duree} onChange={handleChange} />
            <TextField label="Prix HT" type="number" name="prixHT" value={form.prixHT} onChange={handleChange} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filters */}
      <CompaniesFilters />

      {/* Single Card for all Dates + Hours */}
      <Grid container spacing={3}>
  <Grid size={12}>
    <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3 }}>
      {plannings.map((d, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="h6">📅 {d.date}</Typography>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            mt={1}
          >
            {d.hours.map((h, i) => (
              <Chip key={i} label={h} />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  </Grid>
</Grid>

    </Stack>
  );
}
