const master: Menu[] = [
    {
        key: 'Master Order',
        label: 'Master Order',
        path: '/order'
    },
    {
        key: 'Master Email',
        label: 'Master Email',
        path: '/email'
    },
]

const laporan: Menu[] = [
    {
        key: 'Riwayat Scan',
        label: 'Riwayat Scan',
        path: '/history'
    },
]


export interface Menu {
    key: string,
    label: string,
    path?: string,
}

export {master,laporan}