import FinancialRecord from '../models/FinancialRecord.js';

// @desc    Get all records with filtering & pagination
// @route   GET /api/records
// @access  Viewer, Analyst, Admin
export const getAllRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortDirection };

    const [records, total] = await Promise.all([
      FinancialRecord.find(query)
        .populate('createdBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      FinancialRecord.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Viewer, Analyst, Admin
export const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id).populate('createdBy', 'name email');
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a record
// @route   POST /api/records
// @access  Admin
export const createRecord = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;
    const record = await FinancialRecord.create({
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      createdBy: req.user._id,
    });
    await record.populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Admin
export const updateRecord = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;
    const record = await FinancialRecord.findByIdAndUpdate(
      req.params.id,
      { title, amount, type, category, date, notes },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a record
// @route   DELETE /api/records/:id
// @access  Admin
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    record.isDeleted = true;
    record.deletedAt = new Date();
    await record.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a soft-deleted record
// @route   PATCH /api/records/:id/restore
// @access  Admin
export const restoreRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findOne(
      { _id: req.params.id },
      null,
      { includeDeleted: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    record.isDeleted = false;
    record.deletedAt = undefined;
    await record.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: record, message: 'Record restored successfully.' });
  } catch (error) {
    next(error);
  }
};