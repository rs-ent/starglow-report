import React, { useState, useCallback, useRef, useEffect } from "react";

import CategorySelector from "./CategorySelector";
import FormSelector from "./FormSelector";

const AddMilestone = ({ onAdd, selectedDate }) => {
    const [newEvent, setNewEvent] = useState({
        category: { label: "Others", value: "others" },
        date: selectedDate || "",
    });
    const formSelectorRef = useRef();

    useEffect(() => {
        // 부모에서 selectedDate가 변경될 때 formData 업데이트
        if (selectedDate) {
            setNewEvent((prev) => ({ ...prev, date: selectedDate }));
        }
    }, [selectedDate]);

    const handleAdd = () => {
        const formData = formSelectorRef.current?.getFormData(); // FormSelector에서 데이터 가져옴

        if (!formData || Object.keys(formData).length === 0) {
            alert("Form data is invalid. Please complete the required fields.");
            return null;
        }

        console.log("Saving data:", formData);
        onAdd(formData);

        // 상태 초기화
        setNewEvent({
            category: { label: "Others", value: "others" }, // 'Others'로 고정
            date: selectedDate || "",
        });
    };

    const handleCategoryComplete = useCallback((selected) => {
        setNewEvent((prev) => ({
            ...prev,
            category: selected,
            date: selectedDate || "",
        }));
    }, []);

    const handleFormComplete = useCallback((formData) => {
        setNewEvent((prev) => ({
            ...prev,
            ...formData,
        }));
    }, []);

    return (
        <div className="bg-white p-6 shadow-lg rounded-lg mb-8 border border-gray-200">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Add New Milestone</h3>

            {/* Category Selector */}
            <div className="mb-6">
                <CategorySelector
                    onComplete={handleCategoryComplete}
                    defaultCategory="others"
                />
            </div>

            {/* Category에 따른 동적 폼 렌더링 */}
            <div className="mb-6">
                <FormSelector
                    ref={formSelectorRef} // ref 전달
                    category={newEvent.category}
                    date={newEvent.date}
                    onComplete={handleFormComplete}
                />
            </div>

            {/* Add Button */}
            <div className="mt-6 text-right">
                <button
                    onClick={handleAdd}
                    disabled={!formSelectorRef.current?.getFormData()} // 데이터 없으면 비활성화
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring focus:ring-blue-300 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Add Event
                </button>
            </div>
        </div>
    );
};

export default AddMilestone;

