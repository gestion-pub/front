import * as React from 'react';
import { Box, Stack, TextField, Button } from '@mui/material';
import { Plus } from '@phosphor-icons/react';

interface ConducteursFiltersProps {
  filterDate: string;
  setFilterDate: (date: string) => void;
  onAdd: () => void;
}

export default function ConducteursFilters({ filterDate, setFilterDate, onAdd }: ConducteursFiltersProps) {
  return (
    <Box mb={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
        <TextField
          label="Filter by Date"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={onAdd}>
          Add Conducteur
        </Button>
      </Stack>
    </Box>
  );
}
