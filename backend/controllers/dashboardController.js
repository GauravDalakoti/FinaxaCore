import FinancialRecord from '../models/FinancialRecord.js';

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Viewer, Analyst, Admin
export const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59));

    const matchStage = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    const summary = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, ...matchStage } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0, totalExpenses = 0, incomeCount = 0, expenseCount = 0;
    summary.forEach((item) => {
      if (item._id === 'income') { totalIncome = item.total; incomeCount = item.count; }
      if (item._id === 'expense') { totalExpenses = item.total; expenseCount = item.count; }
    });

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        incomeCount,
        expenseCount,
        totalTransactions: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise totals
// @route   GET /api/dashboard/by-category
// @access  Analyst, Admin
export const getCategoryTotals = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const match = { isDeleted: false };
    if (type) match.type = type;
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const data = await FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly trends (last 12 months)
// @route   GET /api/dashboard/monthly-trends
// @access  Analyst, Admin
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const data = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a structured response with all months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const structured = months.map(({ year, month }) => {
      const income = data.find(
        (d) => d._id.year === year && d._id.month === month && d._id.type === 'income'
      );
      const expense = data.find(
        (d) => d._id.year === year && d._id.month === month && d._id.type === 'expense'
      );
      return {
        year,
        month,
        label: new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
        income: income?.total || 0,
        expenses: expense?.total || 0,
        net: (income?.total || 0) - (expense?.total || 0),
      };
    });

    res.status(200).json({ success: true, data: structured });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/recent
// @access  Viewer, Analyst, Admin
export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const records = await FinancialRecord.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly trends (last 8 weeks)
// @route   GET /api/dashboard/weekly-trends
// @access  Analyst, Admin
export const getWeeklyTrends = async (req, res, next) => {
  try {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const data = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, date: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            week: { $isoWeek: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};