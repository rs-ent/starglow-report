import React from 'react';
import RewardsManager from './RewardsManager';

export default async function Page({params}) {
    const {artist_id} = await params;
    return (
        <div className='w-full'>
            <RewardsManager artist_id={artist_id}/>
        </div>
    )
}