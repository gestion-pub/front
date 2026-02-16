'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { routing, usePathname, useRouter } from '@/i18n/routing';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export function LanguageSwitch(): React.JSX.Element {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (event: any) => {
        const nextLocale = event.target.value;
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
            <Select
                value={locale}
                onChange={handleLocaleChange}
                label="Language"
                sx={{
                    color: 'inherit',
                    '&:before': { borderColor: 'transparent' },
                    '&:after': { borderColor: 'transparent' },
                    '&:hover:not(.Mui-disabled):before': { borderColor: 'transparent' },
                    fontSize: '0.875rem'
                }}
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
            </Select>
        </FormControl>
    );
}
