'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

/* ================= TYPES ================= */

export interface Client {
  id: string;
  nom_client: string;
  nom_campagne: string;
  email: string;
  adresse: string;
  telephone: string;
}

/* ================= PAGE ================= */

export default function Page(): React.JSX.Element {
  const [rows, setRows] = React.useState<Client[]>([
    {
      id: '1',
      nom_client: 'Client Test',
      nom_campagne: 'Campagne Janvier',
      email: 'client@test.com',
      adresse: 'Tunis',
      telephone: '22123456',
    },
  ]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [openEdit, setOpenEdit] = React.useState(false);
  const [current, setCurrent] = React.useState<Client | null>(null);

  /* ================= ACTIONS ================= */

  const handleEdit = (row: Client) => {
    setCurrent(row);
    setOpenEdit(true);
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    if (!current) return;

    setRows((prev) =>
      prev.map((r) => (r.id === current.id ? current : r))
    );

    setOpenEdit(false);
  };

  /* ================= UI ================= */

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Clients</Typography>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>Nom Client</TableCell>
                <TableCell>Nom Campagne</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>

                    <TableCell>{row.nom_client}</TableCell>
                    <TableCell>{row.nom_campagne}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.adresse}</TableCell>
                    <TableCell>{row.telephone}</TableCell>

                    {/* ACTIONS */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: '999px', px: 3 }}
                          onClick={() => handleEdit(row)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ borderRadius: '999px', px: 3 }}
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>

        <Divider />

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {/* ================= EDIT DIALOG ================= */}

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Client</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nom Client"
              value={current?.nom_client || ''}
              onChange={(e) =>
                setCurrent({ ...(current as Client), nom_client: e.target.value })
              }
            />
            <TextField
              label="Nom Campagne"
              value={current?.nom_campagne || ''}
              onChange={(e) =>
                setCurrent({ ...(current as Client), nom_campagne: e.target.value })
              }
            />
            <TextField
              label="Email"
              value={current?.email || ''}
              onChange={(e) =>
                setCurrent({ ...(current as Client), email: e.target.value })
              }
            />
            <TextField
              label="Adresse"
              value={current?.adresse || ''}
              onChange={(e) =>
                setCurrent({ ...(current as Client), adresse: e.target.value })
              }
            />
            <TextField
              label="Téléphone"
              value={current?.telephone || ''}
              onChange={(e) =>
                setCurrent({ ...(current as Client), telephone: e.target.value })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
