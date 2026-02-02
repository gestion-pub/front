import * as React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Stack } from '@mui/material';

interface ConducteurCardProps {
  conducteur: {
    id: number;
    date: string;
    heures: string;
    nomClient: string;
    spot: string;
    duree: string;
    spot_id: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export default function ConducteursCard({ conducteur, onEdit, onDelete }: ConducteurCardProps) {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          {conducteur.nomClient}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {conducteur.date} | Heures: {conducteur.heures} | Spot: {conducteur.spot} | Durée: {conducteur.duree} | Spot ID: {conducteur.spot_id}
        </Typography>
      </CardContent>
      <CardActions>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={onEdit}>Edit</Button>
          <Button size="small" variant="contained" color="error" onClick={onDelete}>Delete</Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
