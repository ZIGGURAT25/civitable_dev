// Attach data to the window object to make it globally accessible
window.courseData = {
    CE23511: { title: "Design of Reinforced Concrete Elements", shortCode: "DRC", staff: "Dr. S. Geetha", staffCode: "CE111", credits: "3+1", type: "theory" },
    CE23512: { title: "Foundation Engineering", shortCode: "FE", staff: "S. Muthu Lakshmi", staffCode: "CE112", credits: "3+0", type: "theory" },
    CE23513: { title: "Waste Water Engineering", shortCode: "WWE", staff: "Dr. M. Selvakumar", staffCode: "CE113", credits: "3+0", type: "theory" },
    CE23531: { title: "Structural Analysis", shortCode: "SA", staff: "Mahamood Ul Hasan N", staffCode: "CE131", credits: "3+0+2", type: "lot" },
    CE23C11: { title: "Advanced Construction Techniques", shortCode: "ACT", staff: "Dr. T. Eswary Devi", staffCode: "CEC11", credits: "3+0", type: "elective" },
    CE23F14: { title: "Urban Planning and Development", shortCode: "UPD", staff: "Dr. S Premkumar", staffCode: "CEC11", credits: "3+0", type: "elective" },
    CE23521: { title: "Water and Waste Water Analysis Lab", shortCode: "WWL", staff: "Ammaiappan M.", staffCode: "CE121", credits: "0+0+4", type: "lab" },
    DM1:     { title: "Soft Skills – II", shortCode: "SS-II", staff: "Do More Course", staffCode: "DM001", credits: "0+0+2", type: "lab" }
};

window.timetableData = {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    schedule: {
        Monday: [],
        Tuesday: [
            { period: 1, time: "8:00 AM - 8:50 AM", courseCode: "CE23513", room: "C103 (C Block)" },
            { period: 2, time: "9:00 AM - 9:50 AM", courseCode: "CE23513", room: "C103 (C Block)" },
            { period: 3, time: "11:00 AM - 11:50 AM", courseCode: "CE23511", room: "C102 (C Block)" },
            { period: 4, time: "1:20 PM - 3:00 PM", courseCode: "CE23521", room: "D503 (D Block)", subType: "lab" },
        ],
        Wednesday: [
            { period: 1, time: "8:00 AM - 8:50 AM", courseCode: "CE23531", room: "C102 (C Block)" },
            { period: 2, time: "9:00 AM - 9:50 AM", courseCode: "CE23512", room: "C102 (C Block)" },
            { period: 3, time: "10:00 AM - 10:50 AM", courseCode: "CE23511", room: "C103 (C Block)" },
            { period: 4, time: "11:50 AM - 1:20 PM", courseCode: "CE23531", room: "TIFAC 101 (TIFAC)", subType: "lab" }
        ],
        Thursday: [
            { period: 1, time: "10:00 AM - 10:50 AM", courseCode: "CE23C11", room: "C101 (C Block)" },
            { period: 2, time: "11:00 AM - 11:50 AM", courseCode: "CE23531", room: "C103 (C Block)" },
            { period: 3, time: "1:00 PM - 1:50 PM", courseCode: "CE23F14", room: "C103 (C Block)" },
            { period: 4, time: "3:00 PM - 3:50 PM", courseCode: "CE23513", room: "C103 (C Block)" }
        ],
        Friday: [
            { period: 1, time: "10:00 AM - 11:40 AM", courseCode: "CE23521", room: "D503 (D Block)", subType: "lab" },
            { period: 2, time: "1:00 PM - 1:50 PM", courseCode: "CE23C11", room: "C101 (C Block)" },
            { period: 3, time: "1:00 PM - 1:50 PM", courseCode: "CE23F14", room: "C103 (C Block)" },
            { period: 4, time: "2:00 PM - 2:50 PM", courseCode: "CE23531", room: "C103 (C Block)" },
            { period: 5, time: "3:00 PM - 3:50 PM", courseCode: "CE23511", room: "C101 (C Block)" },
            { period: 6, time: "4:00 PM - 4:50 PM", courseCode: "CE23511", room: "C103 (C Block)" }
        ],
        Saturday: [
            { period: 1, time: "11:00 AM - 11:50 AM", courseCode: "CE23C11", room: "C103 (C Block)" },
            { period: 2, time: "2:00 PM - 2:50 PM", courseCode: "CE23512", room: "C103 (C Block)" },
            { period: 3, time: "3:00 PM - 3:50 PM", courseCode: "CE23F14", room: "C103 (C Block)" },
            { period: 4, time: "4:00 PM - 4:50 PM", courseCode: "CE23512", room: "C103 (C Block)" }
        ],
        Sunday: []
    }
};


window.lastUpdatedDate = '2025-07-23T19:30:00';
