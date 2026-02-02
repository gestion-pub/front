import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';

export interface Campagne {
  id: string;
  image: string;
  name: string;
  updatedAt: Date;
}

export interface LatestCampagnesProps {
  campagnes?: Campagne[];
  sx?: SxProps;
}

export function LatestCampagnes({ campagnes = [], sx }: LatestCampagnesProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Latest campagnes" />
      <Divider />
      <List>
        {campagnes.map((campagne, index) => (
          <ListItem divider={index < campagnes.length - 1} key={campagne.id}>
            <ListItemAvatar>
              {campagne.image ? (
                <Box component="img" src={campagne.image} sx={{ borderRadius: 1, height: '48px', width: '48px' }} />
              ) : (
                <Box
                  sx={{
                    borderRadius: 1,
                    backgroundColor: 'var(--mui-palette-neutral-200)',
                    height: '48px',
                    width: '48px',
                  }}
                />
              )}
            </ListItemAvatar>
            <ListItemText
              primary={campagne.name}
              primaryTypographyProps={{ variant: 'subtitle1' }}
              secondary={`Updated ${dayjs(campagne.updatedAt).format('MMM D, YYYY')}`}
              secondaryTypographyProps={{ variant: 'body2' }}
            />
            <IconButton edge="end">
              <DotsThreeVerticalIcon weight="bold" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
}
