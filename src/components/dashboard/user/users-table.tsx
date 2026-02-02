'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
}: UsersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((user) => user.id), [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = selected.size > 0 && selected.size < rows.length;
  const selectedAll = rows.length > 0 && selected.size === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const isSelected = selected.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) =>
                        e.target.checked ? selectOne(row.id) : deselectOne(row.id)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={row.avatar} />
                      <Typography variant="subtitle2">{row.name}</Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined">
                        Edit
                      </Button>
                      <Button size="small" color="error" variant="outlined">
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Divider />

      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
