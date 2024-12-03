import React from 'react';
import HistoryManager from './HistoryManager';

export default async function Page({params}) {
    const {artist_id} = await params;
    return (
        <div className='w-full'>
            <HistoryManager artist_id={artist_id}/>
        </div>
    )
}