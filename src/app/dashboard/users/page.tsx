'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { PlusIcon } from '@phosphor-icons/react';

import { UsersTable } from '@/components/dashboard/user/users-table';
import type { User } from '@/components/dashboard/user/users-table';


const initialUsers: User[] = [
  { id: '1', name: 'Admin', email: 'admin@test.com', role: 'Admin', avatar: '' },
];

export default function UsersDashboard() {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ name: '', email: '', role: '', avatar: '' });

  const handleAdd = () => {
    if (!newUser.name || !newUser.email || !newUser.role) return;
    setUsers([...users, { id: Date.now().toString(), ...newUser }]);
    setNewUser({ name: '', email: '', role: '', avatar: '' });
    setOpen(false);
  };

  return (
    <Stack spacing={3} className="p-6">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Users</h1>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => setOpen(true)}
        >
          Add
        </Button>
      </Stack>

      {/* Users Table */}
      <UsersTable rows={users} page={0} rowsPerPage={5} count={users.length} />

      {/* Add User Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <TextField
              label="Role"
              fullWidth
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
