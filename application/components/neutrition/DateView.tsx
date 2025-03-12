import React, { Dispatch, SetStateAction } from "react";
import { styles } from "@/app/(tabs)/nutrition";
import { TouchableOpacity, Text } from "react-native";
type DateViewPropsType = {
    currentDate: Date;
    setShowDateSelector: Dispatch<SetStateAction<boolean>>;
    showDateSelector: boolean;
}
const DateView = ({currentDate, setShowDateSelector, showDateSelector}: DateViewPropsType) => {

    // Toggle date selector
    const toggleDateSelector = () => {
        setShowDateSelector(!showDateSelector);
    };    
    
    // Format the date for display
    const getFormattedDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
        });
    };

    return (
        <TouchableOpacity
            style={styles.dateDisplay}
            onPress={toggleDateSelector}
        >
            <Text style={styles.dateText}>{getFormattedDate(currentDate)}</Text>
            <Text style={styles.dateDropdownIndicator}>▼</Text>
        </TouchableOpacity>
    );
};

export default DateView;
