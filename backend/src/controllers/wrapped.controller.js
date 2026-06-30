import * as wrappedService from '../services/wrapped/wrapped.service.js';

export const generate = async (req, res, next) => {
  try {
    const { type, periodOptions } = req.body;
    const report = await wrappedService.generateWrappedReport(req.user._id, type, periodOptions);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

export const getArchive = async (req, res, next) => {
  try {
    const archive = await wrappedService.getWrappedArchive(req.user._id);
    res.json(archive);
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await wrappedService.getWrappedReport(req.params.id, req.user._id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    const slides = await wrappedService.getWrappedSlides(req.params.id, req.user._id);
    res.json({ report, slides });
  } catch (error) {
    next(error);
  }
};

export const share = async (req, res, next) => {
  try {
    const { reportId, slidesIds, theme } = req.body;
    const shareDoc = await wrappedService.shareWrappedReport(reportId, req.user._id, slidesIds, theme);
    res.status(201).json(shareDoc);
  } catch (error) {
    next(error);
  }
};

export const getCompare = async (req, res, next) => {
  try {
    // Basic stub for the compare route if needed as a standalone endpoint
    // The comparison already happens in generateWrappedReport
    res.json({ message: 'Comparison data is included in the generated report.' });
  } catch (error) {
    next(error);
  }
};
