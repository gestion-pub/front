import * as React from 'react';
import { Box, Stack, Button, TextField } from '@mui/material';
import { Plus } from '@phosphor-icons/react';

interface CategoriesFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onAdd: () => void;
}

export default function CategoriesFilters({ searchQuery, setSearchQuery, onAdd }: CategoriesFiltersProps) {
  return (
    <Box mb={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Search Category"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={onAdd}>
          Add Catégorie
        </Button>
      </Stack>
    </Box>
  );
}
