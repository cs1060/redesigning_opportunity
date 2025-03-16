// Helper functions
const formatNumber = (num) => {
    return Math.round(num);
};

const describeProportion = (percentage) => {
    if (percentage >= 75) return "vast majority";
    if (percentage >= 50) return "majority";
    if (percentage >= 30) return "significant portion";
    if (percentage >= 15) return "notable portion";
    return "small portion";
};

module.exports = {
    formatNumber,
    describeProportion
};
