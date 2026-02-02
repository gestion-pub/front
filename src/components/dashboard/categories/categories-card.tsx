import * as React from 'react';
import { Box, Stack, Typography, IconButton, Divider } from '@mui/material';
import { Pencil, Trash } from '@phosphor-icons/react';

interface CategoriesCardProps {
  categorie: { id: number; nom: string };
  onEdit: () => void;
  onDelete: () => void;
}

export default function CategoriesCard({ categorie, onEdit, onDelete }: CategoriesCardProps) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
        <Stack>
          <Typography fontWeight={600}>{categorie.nom}</Typography>
          <Typography variant="caption" color="text.secondary">
            ID : {categorie.id}
          </Typography>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <IconButton onClick={onEdit}>
            <Pencil size={18} />
          </IconButton>
          <IconButton color="error" onClick={onDelete}>
            <Trash size={18} />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
    </Box>
  );
}
