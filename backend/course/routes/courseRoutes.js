const express = require('express');
const courseController = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');
const { validateCourse, handleValidationErrors } = require('../middleware/validation');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/:slug', courseController.getCourse);

// Protected routes (Admin/Instructor)
router.use(protect);

// Apply audit logging to all mutating admin routes below
router.use(auditLogger('Course'));

router.get('/instructor/my-courses', restrictTo('instructor', 'admin'), courseController.getInstructorCourses);
router.post('/', restrictTo('admin', 'instructor'), validateCourse, handleValidationErrors, courseController.createCourse);
router.patch('/:id', restrictTo('admin', 'instructor'), courseController.updateCourse);
router.delete('/:id', restrictTo('admin', 'instructor'), courseController.deleteCourse);
router.post('/:id/cover-image', restrictTo('admin', 'instructor'), uploadSingleImage('image'), courseController.uploadCoverImage);
router.patch('/:id/toggle-publish', restrictTo('admin', 'instructor'), courseController.togglePublish);
router.patch('/:id/complete', restrictTo('admin', 'instructor'), courseController.markAsCompleted);
router.get('/stats/all', restrictTo('admin'), courseController.getCourseStats);

module.exports = router;