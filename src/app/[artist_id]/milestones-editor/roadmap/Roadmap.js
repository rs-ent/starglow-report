'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

import CategorySelector from '../CategorySelector';
import RangeSelector from './RangeSelector';
import EventInputForm from '../FormSelector';

const Roadmap = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepsCompleted, setStepsCompleted] = useState([]);
    const [category, setCategory] = useState(null);
    const [range, setRange] = useState({ start: '', end: '' });
    const [events, setEvents] = useState([]);
    const timelineRef = useRef(null);
    const [doubleClickTime, setDoubleClickTime] = useState(null);
    const dataSet = useMemo(() => new DataSet(events), [events]);
    const [isWizardOpen, setWizardOpen] = useState(false);
    const totalSteps = 3;

    const openWizard = () => setWizardOpen(true);
    const closeWizard = () => {
        setWizardOpen(false);
        setDoubleClickTime(null);
    };

    const handleAddEvent = (newEvent) => setEvents((prev) => [...prev, newEvent]);

    const handleEditEvent = (index, updatedEvent) => {
        setEvents((prev) => prev.map((event, i) => (i === index ? { ...event, ...updatedEvent } : event)));
    };

    const handleDeleteEvent = (index) => setEvents((prev) => prev.filter((_, i) => i !== index));

    const handleStepSuccess = () => {
        setStepsCompleted((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
    };

    const handleCategoryComplete = (selectedCategory) => {
        setCategory(selectedCategory);
        setRange({ start: '', end: '' });
        setEvents([]);
        handleStepSuccess();
    };

    const handleRangeComplete = (selectedRange) => {
        setRange(selectedRange);
        handleStepSuccess();
    };

    const handleEventComplete = (newEvent) => {
        handleAddEvent(newEvent);
        handleStepSuccess();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <CategorySelector onComplete={handleCategoryComplete} />;
            case 2:
                return <RangeSelector onComplete={handleRangeComplete} initialStart={doubleClickTime} />;
            case 3:
                return <EventInputForm onComplete={handleEventComplete} category={category} range={{ start: doubleClickTime, end: doubleClickTime }} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        const container = document.getElementById('timeline');
        console.log('Timeline container:', document.getElementById('timeline'));
        console.log('Timeline instance:', timelineRef.current);
        if (container && !timelineRef.current) {
            const options = { editable: true };
            const newTimeline = new Timeline(container, dataSet, options);
    
            newTimeline.on('doubleClick', (props) => {
                if (!props.item) {
                    setDoubleClickTime(props.time);
                    openWizard();
                }
            });
    
            timelineRef.current = newTimeline; // Store the timeline instance
        }
    }, [dataSet]);

    useEffect(() => {
        if (timelineRef.current && dataSet) {
            dataSet.clear(); // Clear existing items
            dataSet.add(events); // Add new events
        }
    }, [events, dataSet]);

    return (
        <div className="flex flex-col">
            {/* 헤더 및 등록 부분 */}
            <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold mb-6 text-slate-700">Register Future Roadmap</h2>
            </div>

            {/* 타임라인 및 Wizard */}
            <div className="flex flex-col">
                <div id="timeline" ref={timelineRef} style={{ height: '500px', border: '1px solid #ccc' }} />
                {isWizardOpen && <div className="wizard-container">{renderStep()}</div>}
            </div>
        </div>
    );
};

export default Roadmap;