'use client';

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import NewAlbumForm from './roadmap/FormType/NewAlbum';
import ConcertForm from './roadmap/FormType/Concert';
import TourForm from './roadmap/FormType/Tour';
import VideoContentForm from './roadmap/FormType/VideoContent';
import ManagementForm from './roadmap/FormType/Management';
import OthersForm from './roadmap/FormType/Others';

const formMapping = {
    new_album: NewAlbumForm,
    concert: ConcertForm,
    tour: TourForm,
    performance: ConcertForm,
    fan_meeting: ConcertForm,
    fan_camp: ConcertForm,
    sign_meeting: ConcertForm,
    video_content: VideoContentForm,
    movie: ManagementForm,
    drama: ManagementForm,
    variety: ManagementForm,
    music_show: ManagementForm,
    others: OthersForm, // 예제용
};

const FormSelector = forwardRef(({ category = { label: 'Others', value: 'others' }, date }, ref) => {
    const SelectedForm = formMapping[category.value];
    const childRef = useRef();
    
    const [selectedDate, setSelectedDate] = useState(date || '');
    useEffect(() => {
        setSelectedDate(date || '');
    }, [date]);

    useImperativeHandle(ref, () => ({
        getFormData: () => childRef.current?.getFormData(), // SelectedForm의 데이터를 반환
    }));

    return SelectedForm ? (
        <SelectedForm ref={childRef} date={selectedDate} category={category} />
    ) : (
        <div><p></p></div>
    );
});

export default FormSelector;