const AnalyticsModel = require("../models/AnalyticsModel");

const addAnalytics = async (analyticsData) => {
    const addedAnalytics = await AnalyticsModel.create(analyticsData);
    return addedAnalytics;
};

const getAnalytics = async (query) => {
    const { type, metric, limit } = query;
    const filter = {};

    if (type) filter.type = type;
    if (metric) filter.metric = metric;

    const analytics = await AnalyticsModel.find(filter).sort({ createdAt: -1 }).limit(Number(limit) || 50);
    return analytics;
};

module.exports = {
    addAnalytics,
    getAnalytics,
};